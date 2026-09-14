import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { useFavorites } from '../../context/FavoritesContext';
import '../../styles/components/favoriteButton.css';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

/**
 * FavoriteButton – כפתור לב גנרי להוספה/הסרה ממועדפים (צד-לקוח בלבד).
 *
 * Props:
 *   place    – אובייקט המקום (חובה: place_id/id, מומלץ גם name, description,
 *              image_url, categories, avg_rating, review_count, created_by_username)
 *   size     – 'sm' | 'md' | 'lg' (lg מציג גם תווית טקסט)
 *   withLabel– להציג תווית טקסט לצד הלב (ברירת מחדל: רק ב-lg)
 *   className– קלאסים נוספים, למשל 'favorite-btn--overlay' למיקום מעל תמונה
 */
export default function FavoriteButton({ place, size = 'md', withLabel, className = '' }) {
  const { user } = useContext(UserContext);
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const placeId = place?.place_id ?? place?.id;
  const active = Boolean(user) && isFavorite(placeId);
  const showLabel = withLabel ?? size === 'lg';

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite(place);
  };

  const label = !user
    ? 'התחברו כדי לשמור מועדפים'
    : active
      ? 'הסר מהמועדפים'
      : 'הוסף למועדפים';

  return (
    <button
      type="button"
      className={`favorite-btn favorite-btn--${size} ${active ? 'favorite-btn--active' : ''} ${className}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" className="favorite-btn__icon" aria-hidden="true">
        <path d={HEART_PATH} />
      </svg>
      {showLabel ? (
        <span className="favorite-btn__label">{active ? 'במועדפים' : 'הוסף למועדפים'}</span>
      ) : (
        <span className="favorite-btn__tooltip">{label}</span>
      )}
    </button>
  );
}
