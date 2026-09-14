import StarRating from '../ui/StarRating';
import FavoriteButton from '../ui/FavoriteButton';
import PlaceOwnerActions from './PlaceOwnerActions';
import '../../styles/pages/places.css';

export default function PlaceInfo({ place, onPlaceDeleted, onPlaceUpdated }) {
  const {
    name,
    description,
    categories = [],
    address,
    created_by_username,
    image_url,
    avg_rating,
    review_count,
  } = place;

  return (
    <section className="place-info-section">
      {image_url && (
        <div className="place-detail-image-wrap">
          <img src={image_url} alt={name} className="place-detail-image" />
        </div>
      )}

      <div className="place-info-section-body">
        <div className="place-detail-header">
          <h1 className="place-detail-title">{name}</h1>
          <div className="place-detail-header-actions">
            <FavoriteButton place={place} size="lg" />
            <PlaceOwnerActions
              place={place}
              onDeleted={onPlaceDeleted}
              onUpdated={onPlaceUpdated}
            />
          </div>
        </div>

        <StarRating rating={avg_rating} count={review_count} size="lg" />

        {created_by_username && (
          <p className="place-author">📝 פורסם על ידי: {created_by_username}</p>
        )}

        {categories.length > 0 && (
          <div className="place-categories-list">
            {categories.map((cat) => (
              <span key={cat} className="category-pill">{cat}</span>
            ))}
          </div>
        )}

        {address && (
          <div className="place-location">
            📍 <strong>כתובת:</strong> {address}
          </div>
        )}

        {description && (
          <div className="place-description-content">
            <h3>אודות המקום</h3>
            <p>{description}</p>
          </div>
        )}
      </div>
    </section>
  );
}