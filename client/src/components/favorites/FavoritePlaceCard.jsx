import { Link } from 'react-router-dom';
import FavoriteButton from '../ui/FavoriteButton';
import StarRating from '../ui/StarRating';

const EMOJIS = ['🏖️', '⛰️', '🏛️', '🏕️', '🏜️', '🌲', '🏙️', '🏝️', '🛣️', '🗺️'];
const RECENT_MS = 3 * 24 * 60 * 60 * 1000; // 3 ימים

function thumbEmoji(name) {
  const idx = name ? name.charCodeAt(0) % EMOJIS.length : 0;
  return EMOJIS[idx];
}

function isRecentlyAdded(createdAt) {
  if (!createdAt) return false;
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time < RECENT_MS;
}

/**
 * FavoritePlaceCard – כרטיס מועדף יחיד בעמוד "המועדפים שלי".
 * ניתן לגרירה (Drag & Drop) לתוך תיקייה ב-FolderSidebar, וגם לשיבוץ
 * מהיר באמצעות תפריט נפתח.
 *
 * Props:
 *   item    – פריט מועדף (placeId, name, description, image_url, ...)
 *   folders – [{ id, name }] לתפריט הבחירה
 *   onMove(placeId, folderId|null)
 */
export default function FavoritePlaceCard({ item, folders, onMove }) {
  return (
    <article
      className="fav-place-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.placeId);
        e.dataTransfer.effectAllowed = 'move';
      }}
      title="ניתן לגרור לתיקייה"
    >
      <FavoriteButton
        place={{ place_id: item.placeId, name: item.name }}
        size="sm"
        className="favorite-btn--overlay"
      />

      {isRecentlyAdded(item.createdAt) && (
        <span className="fav-place-card__badge">✨ נוסף לאחרונה</span>
      )}

      <Link to={`/places/${item.placeId}`} className="fav-place-card__media">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} loading="lazy" />
        ) : (
          <div className="fav-place-card__emoji" aria-hidden="true">{thumbEmoji(item.name)}</div>
        )}
      </Link>

      <div className="fav-place-card__body">
        <Link to={`/places/${item.placeId}`} className="fav-place-card__title">
          {item.name}
        </Link>

        <StarRating rating={item.avg_rating} count={item.review_count} size="sm" />

        {item.description && (
          <p className="fav-place-card__desc line-clamp-3">{item.description}</p>
        )}
      </div>

      <div className="fav-place-card__footer">
        <span className="fav-place-card__drag-hint" aria-hidden="true">⠿⠿ גררו לתיקייה</span>

        <select
          className="fav-folder-select"
          value={item.folderId || ''}
          onChange={(e) => onMove(item.placeId, e.target.value ? Number(e.target.value) : null)}
          aria-label={`העברת "${item.name}" לתיקייה`}
        >
          <option value="">ללא תיקייה</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
      </div>
    </article>
  );
}
