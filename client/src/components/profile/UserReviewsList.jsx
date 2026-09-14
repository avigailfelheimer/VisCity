import { Link } from 'react-router-dom';
import UserReviewItem from './UserReviewItem';

export default function UserReviewsList({ reviews, loading, error }) {
  if (loading) {
    return (
      <div className="profile-tab-loading">
        <div className="profile-spinner" />
        <span>טוען תגובות...</span>
      </div>
    );
  }

  if (error) {
    return <div className="profile-tab-error">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="profile-tab-empty">
        <div className="profile-tab-empty__icon">💬</div>
        <p>עדיין לא כתבת תגובות.</p>
        <Link to="/places" className="profile-empty-link">לעמוד הטיולים</Link>
      </div>
    );
  }

  return (
    <div className="profile-reviews-list">
      {reviews.map((review) => (
        <UserReviewItem key={review.review_id} review={review} />
      ))}
    </div>
  );
}
