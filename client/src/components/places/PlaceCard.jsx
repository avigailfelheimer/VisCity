import { useNavigate } from 'react-router-dom';
import PlaceOwnerActions from './PlaceOwnerActions';
import StarRating from '../ui/StarRating';
import FavoriteButton from '../ui/FavoriteButton';
import { formatDate } from '../../utils/dateUtils';
import '../../styles/pages/places.css';

const EMOJIS = ['🏖️', '⛰️', '🏛️', '🏕️', '🏜️', '🌲', '🏙️', '🏝️', '🛣️', '🗺️'];

function PlaceThumbnail({ name }) {
  const idx = name ? name.charCodeAt(0) % EMOJIS.length : 0;
  return (
    <div className="place-emoji-thumb" aria-hidden="true">
      {EMOJIS[idx]}
    </div>
  );
}

export default function PlaceCard({ place }) {
  const navigate = useNavigate();
  const {
    place_id,
    name,
    description,
    categories = [],
    created_by_username,
    created_at,
    image_url,
    avg_rating,
    review_count,
  } = place;

  const createdDate = formatDate(created_at);

  const handleCardClick = () => navigate(`/places/${place_id}`);
  const handleShowMore  = (e) => { e.stopPropagation(); navigate(`/places/${place_id}`); };

  return (
    <div
      className="place-card"
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      tabIndex={0}
      role="button"
      aria-label={`מקום: ${name}`}
    >
      <FavoriteButton place={place} size="sm" className="favorite-btn--overlay" />
      {image_url && (
        <div className="place-card__image-wrap">
          <img src={image_url} alt={name} className="place-card__image" loading="lazy" />
        </div>
      )}

      <div className="place-card__content">
        <div className="place-card__header">
          {!image_url && <PlaceThumbnail name={name} />}
          {categories.length > 0 && (
            <div className="place-categories">
              {categories.slice(0, 3).map((cat) => (
                <span key={cat} className="category-tag">{cat}</span>
              ))}
            </div>
          )}
        </div>

        <h2 className="place-name">{name}</h2>

        <StarRating rating={avg_rating} count={review_count} size="sm" />

        {description && (
          <p className="place-desc line-clamp-3">{description}</p>
        )}

        {(created_by_username || createdDate) && (
          <div className="place-meta">
            {created_by_username && <span>נוצר על ידי {created_by_username}</span>}
            {createdDate          && <span>{createdDate}</span>}
          </div>
        )}

        <div className="place-card__footer">
          <button className="btn-show-more" onClick={handleShowMore}>
            הצג עוד
          </button>
          <PlaceOwnerActions
            place={place}
            onDeleted={() => window.location.reload()}
            onUpdated={() => window.location.reload()}
          />
        </div>
      </div>
    </div>
  );
}