import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { FavoritesProvider } from './context/FavoritesContext';

import PublicRoute from './components/common/PublicRoute';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import PlaceList from './pages/places/PlaceList';
import PlaceDetail from './pages/places/PlaceDetail';
import EditPlacePage from './components/places/EditPlacePage';
import Gallery from './pages/gallery/Gallery';
import GalleryPost from './pages/gallery/GalleryPost';

import Profile from './pages/profile/Profile';
import ProfileEdit from './pages/profile/ProfileEdit';
import UsersAdmin from './pages/admin/UsersAdmin';

import AdminLogin from './pages/auth/AdminLogin';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';

import Favorites from './pages/Favorites';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <UserProvider>
    <FavoritesProvider>
      <Routes>
        {/* Auth routes (no navbar) */}
        <Route element={<PublicRoute />}>
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          {/* הוספנו את דף ההתחברות הייעודי למנהל */}
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* עמוד עריכת מקום – ללא navbar, נפתח בטאב חדש */}
        <Route element={<ProtectedRoute />}>
          <Route path="/places/:id/edit" element={<EditPlacePage />} />
        </Route>

        {/* Main app with Navbar */}
        <Route element={<Layout />}>
          <Route path="/home"                          element={<Home />} />
          <Route path="/places"                        element={<PlaceList />} />
          <Route path="/places/:id"                    element={<PlaceDetail />} />
          <Route path="/gallery"                       element={<Gallery />} />
          <Route path="/gallery/:placeId/:mediaId"     element={<GalleryPost />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile"      element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/favorites"    element={<Favorites />} />
            {/* תאימות לאחור לקישור הישן */}
            <Route path="/itinerary"    element={<Navigate to="/favorites" replace />} />
          </Route>
          
          {/* עוטף ההגנה המיוחד למנהלים שמגן על פאנל הניהול */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/users" element={<UsersAdmin />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/"    element={<Navigate to="/home" replace />} />
        <Route path="/403" element={<ErrorPage code={403} />} />
        <Route path="/500" element={<ErrorPage code={500} />} />
        <Route path="*"    element={<ErrorPage code={404} />} />
      </Routes>
    </FavoritesProvider>
    </UserProvider>
  );
}

export default App;