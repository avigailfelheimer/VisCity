# 🗺️ VisiCity — Full-Stack Travel Community App

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)


> **פרויקט גמר | Full-Stack Web Application**  
> A community-driven travel platform where users discover, share, and review places — built as a final-year capstone project demonstrating production-level full-stack development.

<br>

## 🌐 Live Preview

![VisiCity Preview](https://github.com/user-attachments/assets/79049179-8115-4017-b0c0-396f1dd8e58c)

> _Hebrew RTL interface · Neo-Brutalism design system · Mobile-first responsive layout_

<br>

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design (MySQL)](#database-design-mysql)
- [Backend – Node.js / Express](#backend--nodejs--express)
- [Frontend – React + Vite](#frontend--react--vite)
- [Key Features](#key-features)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

<br>

---

## Project Overview

VisiCity is a Hebrew-language, RTL-first travel community application. Users can browse places (sites, restaurants, attractions), add their own locations with Google Maps integration, upload photos, write reviews with ratings, and save favorites into custom itinerary folders.

The project was built with a strong separation of concerns: a REST API backend, a relational SQL database, and a decoupled React SPA — each layer designed to be maintainable and extendable.

<br>

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| **Node.js + Express 5** | REST API server, routing, middleware |
| **MySQL 8 + mysql2** | Relational database (raw SQL, no ORM) |
| **JWT (jsonwebtoken)** | Stateless authentication |
| **bcrypt** | Secure password hashing |
| **Multer** | File upload handling (images/audio) |
| **Socket.IO 4** | Real-time events (media uploads, place approvals) |
| **dotenv** | Environment configuration |
| **Nodemon** | Development auto-restart |

### Frontend
| Technology | Role |
|---|---|
| **React 19** | UI component library |
| **React Router DOM v7** | Client-side routing with protected routes |
| **Vite 8** | Build tool and dev server |
| **Google Maps / Places API** | Interactive maps, place autocomplete |
| **CSS Custom Properties** | Design token system (no CSS framework) |

### Database
| Technology | Role |
|---|---|
| **MySQL 8** | Primary data store |
| **Raw SQL** | All queries written manually (no ORM) |
| **JSON columns** | `categories`, `opening_hours` stored as JSON in MySQL |
| **Relational constraints** | Foreign keys, ON DELETE CASCADE, CHECK constraints |

<br>

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  CLIENT                      │
│   React 19 + Vite  |  RTL Hebrew SPA        │
│   React Router v7  |  Context API           │
│   Google Maps API  |  Neo-Brutalism CSS     │
└─────────────┬───────────────────────────────┘
              │  HTTP REST + Socket.IO
              │  JWT Bearer Token
┌─────────────▼───────────────────────────────┐
│                  SERVER                      │
│   Express 5  |  Route → Middleware           │
│              |  Controller → Service         │
│              |  Model (raw SQL)              │
│   Socket.IO  |  Real-time events            │
│   Multer     |  File upload + static serve  │
└─────────────┬───────────────────────────────┘
              │  mysql2 (connection pool)
┌─────────────▼───────────────────────────────┐
│             DATABASE                         │
│   MySQL 8  |  8 normalized tables           │
│            |  FK constraints, CHECK rules   │
│            |  JSON columns (categories)     │
└─────────────────────────────────────────────┘
```

### Layered Backend Architecture

The server is structured in four explicit layers — every feature follows the same pattern:

```
Route  →  Middleware  →  Controller  →  Service  →  Model  →  MySQL
```

- **Routes** declare only endpoints and the middleware pipeline.
- **Middleware** handles cross-cutting concerns (auth, ownership, file upload).
- **Controllers** parse the request and call the service layer; they never touch the database directly.
- **Services** contain business logic, validation, and error construction.
- **Models** contain only SQL — one function per query, returns raw data.

<br>

---

## Database Design (MySQL)

All queries are written in raw SQL using the `mysql2` library with a connection pool. No ORM was used, keeping queries explicit and predictable.

### Schema Overview

```sql
users           – user accounts (id, username, email, user_type)
credentials     – passwords stored separately (bcrypt hash, FK → users)
places          – travel locations (name, description, categories JSON, lat/lng,
                  google_place_id, opening_hours JSON, is_approved)
favorite_folders – named itinerary folders per user
favorites       – many-to-many: users ↔ places, with folder grouping
reviews         – ratings (1–5) + comments per place
review_helpful  – up/down votes on reviews (unique per user+review)
media           – images / audio files per place (url, type, uploader)
```

### Entity-Relationship Diagram

```
users ──────< credentials      (1:1, separate table for password isolation)
users ──────< places           (created_by, SET NULL on user delete)
users ──────< favorite_folders (CASCADE on user delete)
users ──────< favorites        (CASCADE on user delete)
users ──────< reviews          (CASCADE on user delete)
users ──────< media            (SET NULL on user delete)
places ─────< favorites        (CASCADE on place delete)
places ─────< reviews          (CASCADE on place delete)
places ─────< media            (CASCADE on place delete)
favorite_folders < favorites   (SET NULL on folder delete)
reviews ────< review_helpful   (CASCADE on review delete)
```

### Notable SQL Design Decisions

**Separated credentials table** — passwords are stored in a `credentials` table (not in `users`), so user profile queries never accidentally expose password hashes:

```sql
CREATE TABLE credentials (
    user_id INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**CHECK constraints on enums** — instead of ENUM columns (which are hard to migrate), string columns with CHECK constraints are used:

```sql
CHECK (user_type IN ('user', 'admin'))
CHECK (media_type IN ('image', 'video', 'audio'))
CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)
CHECK (vote IN ('up', 'down'))
```

**JSON columns for flexible data** — `categories` and `opening_hours` are stored as MySQL JSON, allowing the client to store varied structures without extra join tables:

```sql
categories    JSON NOT NULL,     -- ["beach", "nature", "hiking"]
opening_hours JSON               -- { "sun": "09:00–17:00", ... }
```

**Composite unique constraints** prevent duplicate records at the DB level:

```sql
UNIQUE(user_id, place_id)             -- in favorites
UNIQUE KEY unique_vote (review_id, user_id)  -- in review_helpful
```

<br>

---

## Backend – Node.js / Express

### Authentication & Authorization

The auth system is stateless, using **JWT Bearer tokens** signed with a secret from `.env`.

**Two middleware functions handle all authorization needs:**

`authenticateToken` — verifies the JWT in `Authorization: Bearer <token>`, attaches `req.user`, and handles `TokenExpiredError` and `JsonWebTokenError` separately:

```js
export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '...' });
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
};
```

`authorizeOwnership` — a **generic middleware factory** that accepts any model's `getById` function, the route parameter name, and the owner field. This lets the same middleware protect Places, Reviews, and Media routes without duplication:

```js
// Usage in routes:
router.put('/:id', authenticateToken,
    authorizeOwnership({
        getById: getPlaceForAuthorization,
        paramName: 'id',
        ownerField: 'created_by',
    }),
    putPlace
);
```

**Password security** — bcrypt with a salt round of 10, stored in the isolated `credentials` table. The `PasswordModel` only ever touches this table.

### Real-Time: Socket.IO

The app uses Socket.IO on the same HTTP server for real-time events:

```js
export const SOCKET_EVENTS = {
    PLACE_APPROVED:  'place:approved',
    PLACE_POPULAR:   'place:popular',   // fires when a place hits a reviews/favorites threshold
    MEDIA_UPLOADED:  'media:uploaded',
};
```

The socket handshake optionally accepts a JWT (`socket.handshake.auth.token`), allowing the server to authenticate socket connections and emit user-targeted events.

### File Upload: Multer

Media files are handled with `multer` (`upload.single()`), saved to a local `uploads/` folder. The folder is served as static via Express:

```js
app.use('/uploads', express.static('uploads'));
```

### Error Handling

All error messages and HTTP status codes are centralized in `server/const/errorConst.js`. The global Express error handler distinguishes between known application errors (with a `.status` property thrown by the service layer) and unexpected errors, and never leaks internal DB details to the client.

A dedicated case handles MySQL foreign key violations (`ER_NO_REFERENCED_ROW_2`) that can occur with stale JWTs after a database reset.

<br>

---

## Frontend – React + Vite

### Routing Architecture

React Router v7 with three route protection patterns:

```
PublicRoute       – redirects logged-in users away from /login, /register
ProtectedRoute    – redirects anonymous users to /login
AdminProtectedRoute – requires role === 'admin'
```

Routes are declared in `App.jsx` using a nested layout pattern. The `Layout` component (Navbar + Outlet + ScrollToTopButton) wraps all main app routes in a single tree:

```
/login, /register, /admin/login   → PublicRoute (no Navbar)
/places/:id/edit                  → ProtectedRoute (no Navbar, opens in new tab)
/home, /places, /gallery, ...     → Layout (with Navbar)
  /profile, /favorites            → nested ProtectedRoute
  /admin/users                    → nested AdminProtectedRoute
```

### State Management

Global state uses **React Context** (no external store):

- `UserContext` — current user object + login/logout, persisted to `localStorage`
- `FavoritesContext` — favorites list + folder structure, synced with the API on login

### API Layer

All HTTP calls go through a single `api/client.js` module that wraps `fetch` with:
- Authorization header injection
- Automatic JSON parsing
- Centralized 401 handling (clears localStorage + redirects to `/login`)
- Configurable retry count per call type

```js
// All backend calls go through this, never raw fetch:
export const getData  = (path, token, retries = 1) => request(path, { method: 'GET', token, retries });
export const create   = (path, body, token)         => request(path, { method: 'POST', body, token });
export const update   = (path, body, token)         => request(path, { method: 'PUT', body, token });
export const deleteItem = (path, token)             => request(path, { method: 'DELETE', token });
export const uploadFile = (path, formData, token)   => request(path, { method: 'POST', body: formData, isFormData: true, token });
```

The base URL is defined once in `config/env.js` and never hardcoded in component files.

### Google Maps Integration

Two custom components wrap the Google Maps JavaScript API:

- `PlaceMap` — renders an embedded map with a marker for a given lat/lng
- `PlaceLocationPicker` — interactive map for picking coordinates when adding/editing a place, with Google Places autocomplete

The app gracefully handles Google Maps auth failures via a global `gm_authFailure` callback that dispatches a custom DOM event — displayed as a clean fallback in the UI instead of the default broken overlay.

<br>

---

## Key Features

### 🏝️ Places (Discovery)
- Browse all approved places with pagination and free-text search
- Filter by category (beach, nature, city, food, etc.)
- View place details with map, average rating, reviews, and media gallery
- Add new places (authenticated users) — location picker with Google Maps autocomplete
- Edit/delete own places (ownership enforced at both API and UI level)

### 🖼️ Media Gallery & Lightbox
- Upload images (and audio) directly to a place's page
- Full-screen Lightbox component with:
  - Keyboard navigation (← → Esc)
  - Touch swipe on mobile
  - Image fade-in animation
  - Uploader info + timestamp in footer
  - In-lightbox delete for owners/admins
- Community gallery page aggregating media from all places
- Click any gallery thumbnail to open the lightbox instead of navigating away

### ⭐ Reviews
- Star rating (1–5) with animated visual display
- Text comments per place
- Up/down helpful votes on reviews (unique per user)
- Review modals without page navigation

### 📁 Favorites & Itineraries
- Save any place to favorites
- Organize favorites into named folders (itinerary planning)
- Drag-to-reorder within folders
- Folder creation, rename, and deletion

### 👤 User Profile
- View own places, reviews, and media
- Edit profile details
- Tab-based layout with lazy loading per section

### ⚙️ Admin Panel
- Dedicated admin login route
- User management (list, search, role management)
- Separate admin-protected route guard

### 🔔 Real-Time Notifications
- Socket.IO integration for live events:
  - Place approval notifications
  - Popularity alerts (place reaches threshold of reviews/favorites)
  - Media upload broadcasts

<br>

---

## Design System

The UI is built with a custom **Neo-Brutalism design system** — entirely in CSS Custom Properties, no external CSS framework.

### Design Tokens (single source of truth)

```css
:root {
  /* Palette */
  --nb-yellow:   #FFE135;   /* primary accent */
  --nb-coral:    #FF6B6B;   /* danger / highlight */
  --nb-mint:     #4ECDC4;   /* success / places */
  --nb-lavender: #C9B8FF;   /* secondary accent */
  --nb-black:    #1A1A2E;   /* text / borders */

  /* Borders */
  --nb-border:   3px solid #1A1A2E;
  --nb-shadow:   5px 5px 0px #1A1A2E;   /* hard drop shadow */
  --nb-shadow-lg:8px 8px 0px #1A1A2E;

  /* Shape */
  --nb-radius:   12px;
  --nb-font:     'Trebuchet MS', system-ui, sans-serif;
}
```

### Key visual principles
- **Hard drop shadows** instead of blurs — `5px 5px 0 #1A1A2E`
- **Bold borders** — 2–3px solid black on all interactive elements
- **Lift-on-hover** — `transform: translate(-2px, -2px)` + deeper shadow
- **Asymmetric accents** — colored top borders on card components
- **RTL-first** — all layouts use `dir="rtl"`, `inset-inline-start/end` instead of `left/right`

<br>

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL 8
- Google Maps API key (optional – app degrades gracefully without it)

### 1. Clone the repository

```bash
git clone https://github.com/SaritNerya/VisCity-project.git
cd VisCity-project
```

### 2. Set up the database

```bash
mysql -u root -p < server/schema.sql
# Optional: seed data
mysql -u root -p travel_app < server/init_db.sql
```

### 3. Configure the server

```bash
cd server
cp .env.example .env   # or create .env manually
```

```env
# server/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=travel_app

JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
PORT=3000
```

```bash
npm install
npm run dev   # nodemon app.js
```

### 4. Configure and run the client

```bash
cd client
npm install
npm run dev   # Vite dev server at http://localhost:5173
```

To change the API base URL (e.g. for deployment):

```js
// client/src/config/env.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

<br>

---

## API Reference

### Auth  `POST /auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT + user object |

### Places  `GET|POST|PUT|DELETE /places`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/places` | — | List places (pagination, search, category filter) |
| GET | `/places/:id` | — | Get place by ID (includes avg_rating, review_count) |
| POST | `/places` | ✅ | Create new place |
| PUT | `/places/:id` | ✅ Owner | Update place |
| DELETE | `/places/:id` | ✅ Owner | Delete place |

### Reviews  `GET|POST|DELETE /places/:placeId/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/places/:placeId/reviews` | — | Get all reviews for a place |
| POST | `/places/:placeId/reviews` | ✅ | Add review |
| DELETE | `/places/:placeId/reviews/:id` | ✅ Owner | Delete review |
| POST | `/places/:placeId/reviews/:id/helpful` | ✅ | Vote helpful/unhelpful |

### Media  `GET|POST|DELETE /places/:placeId/media`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/places/:placeId/media` | — | Get all media for a place |
| POST | `/places/:placeId/media` | ✅ | Upload image/audio (multipart) |
| DELETE | `/places/:placeId/media/:id` | ✅ Owner/Admin | Delete media item |

### Itinerary (Favorites)  `/itinerary`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/itinerary` | ✅ | Get user's favorites |
| POST | `/itinerary` | ✅ | Add place to favorites |
| DELETE | `/itinerary/:placeId` | ✅ | Remove from favorites |
| GET | `/itinerary/folders` | ✅ | Get user's folders |
| POST | `/itinerary/folders` | ✅ | Create folder |
| PATCH | `/itinerary/folders/:id` | ✅ | Rename folder |
| DELETE | `/itinerary/folders/:id` | ✅ | Delete folder |

### Users  `/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/user/me` | ✅ | Get current user profile |
| PUT | `/user/me` | ✅ | Update profile |
| GET | `/user` | ✅ Admin | List all users |
| DELETE | `/user/:id` | ✅ Admin | Delete user |

<br>

---

## Project Structure

```
VisCity-project/
├── client/                        # React SPA (Vite)
│   ├── index.html                 # Entry HTML, Google Maps script
│   ├── src/
│   │   ├── api/                   # HTTP layer (all fetch calls centralized)
│   │   │   ├── client.js          #   base request wrapper (auth, errors, retry)
│   │   │   ├── placesApi.js
│   │   │   ├── mediaApi.js
│   │   │   ├── reviewsApi.js
│   │   │   ├── usersApi.js
│   │   │   └── favoritesApi.js
│   │   ├── config/
│   │   │   └── env.js             # API_BASE_URL (single source of truth)
│   │   ├── constants/             # Shared JS constants
│   │   ├── context/               # UserContext, FavoritesContext
│   │   ├── hooks/                 # Custom hooks (useReviews, useUserPlaces, ...)
│   │   ├── components/
│   │   │   ├── common/            # Layout, Navbar (NavLink), ProtectedRoute, ScrollToTop
│   │   │   ├── ui/                # Reusable primitives: Lightbox, StarRating, FavoriteButton
│   │   │   ├── places/            # PlaceCard, PlaceInfo, AddPlaceModal, EditPlacePage, Map
│   │   │   ├── media/             # PlaceMediaGrid (upload + lightbox)
│   │   │   ├── gallery/           # GalleryGrid (lightbox)
│   │   │   ├── favorites/         # FavoritePlaceCard, FolderSidebar
│   │   │   ├── reviews/           # ReviewModal
│   │   │   └── profile/           # ProfileTabs
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register, AdminLogin
│   │   │   ├── places/            # PlaceList, PlaceDetail
│   │   │   ├── gallery/           # Gallery, GalleryPost
│   │   │   ├── profile/           # Profile, ProfileEdit
│   │   │   ├── admin/             # UsersAdmin
│   │   │   ├── Favorites.jsx
│   │   │   ├── Home.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── styles/
│   │   │   ├── base/              # variables.css, global.css, shared.css
│   │   │   ├── components/        # navbar.css, lightbox.css, favoriteButton.css, scrollToTop.css
│   │   │   └── pages/             # places.css, home.css, gallery.css, auth.css, ...
│   │   ├── utils/
│   │   │   └── dateUtils.js
│   │   ├── App.jsx                # Route tree
│   │   ├── main.jsx
│   │   └── index.css              # Imports base/* (design system entry point)
│   └── public/
│       └── favicon.svg            # Custom branded icon
│
├── server/                        # Node.js / Express API
│   ├── app.js                     # Express app, Socket.IO init, error handler
│   ├── routes/                    # Route declarations only
│   ├── controller/                # Request parsing → call service
│   ├── services/                  # Business logic + error construction
│   ├── models/                    # Raw SQL queries (mysql2)
│   ├── middleWare/
│   │   ├── authMiddleware.js      # authenticateToken, authorizeOwnership (generic)
│   │   └── uploadMiddleware.js    # multer config
│   ├── services/
│   │   └── socketManager.js       # Socket.IO setup + event constants
│   └── const/
│       └── errorConst.js          # All HTTP error messages and status codes
│
└── dataBase/
    ├── schema.sql                 # Full CREATE TABLE statements
    └── init_db.sql                # Seed data
```

<br>

---

## What I Learned / Highlights

- Designing a **normalized relational schema** from scratch and writing all queries in raw SQL — appreciating what ORMs abstract away, and what they hide
- Building a **generic authorization middleware factory** (`authorizeOwnership`) that works across any resource without code duplication
- Implementing **JWT-based stateless auth** with proper token expiry handling on both client and server
- Managing **real-time communication** with Socket.IO alongside REST, including authenticated socket connections
- Building a **reusable design system** entirely in CSS Custom Properties — no framework dependency
- Structuring a React app at scale: separating concerns across Context, custom hooks, a typed API layer, and a component hierarchy
- Handling **file uploads** end-to-end: Multer on the server, FileReader/FormData on the client, static file serving

---

<p align="center">Built with ❤️ by <a href="https://github.com/SaritNerya">Sarit Nerya</a></p>
