import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

const STARS = [1, 2, 3, 4, 5];

export default function UserReviewItem({ review }) {
  const { place_id, place_name, rating, comment, created_at } = review;
  const createdDate = formatDate(created_at);

  return (
    <article className="profile-review-item" dir="rtl">
      <div className="profile-review-item__top">
        <Link to={`/places/${place_id}`} className="profile-review-item__place">
          {place_name || 'מקום שהוסר'}
        </Link>
        <div className="profile-review-item__stars" aria-label={`דירוג ${rating} מתוך 5`}>
          {STARS.map((s) => (
            <span key={s} className={`review-star ${s <= rating ? 'review-star--filled' : ''}`}>★</span>
          ))}
        </div>
      </div>

      {comment && <p className="profile-review-item__comment">{comment}</p>}

      {createdDate && <span className="profile-review-item__date">{createdDate}</span>}
    </article>
  );
}
