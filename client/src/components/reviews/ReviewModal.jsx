import { useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../context/userContext';
import { useReviews } from '../../hooks/useReviews';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import '../../styles/pages/places.css';

export default function ReviewModal({ placeId, placeName, onClose }) {
  const { user } = useContext(UserContext);
  const backdropRef = useRef(null);
  
  // שימוש ב-Hook שניצרנו כדי לייבא את כל הלוגיקה בשורה אחת!
  const { reviews, loading, error, addReview, editReview, removeReview, voteReview } = useReviews(placeId, user);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) 
    : null;

  return (
    <div
      className="review-modal-backdrop"
      ref={backdropRef}
      onClick={(e) => e.target === backdropRef.current && onClose()}
      role="dialog"
    >
      <div className="review-modal">
        <div className="review-modal__header">
          <div className="review-modal__title-row">
            <h2 className="review-modal__title">תגובות — {placeName}</h2>
            {avgRating && (
              <div className="review-modal__avg">
                <span className="review-avg-star">★</span>
                <span>{avgRating}</span>
                <span>({reviews.length})</span>
              </div>
            )}
          </div>
          <button className="review-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="review-modal__body">
          {user ? (
            <ReviewForm onSubmit={addReview} />
          ) : (
            <div className="review-login-notice">יש להתחבר כדי להוסיף תגובה.</div>
          )}

          <div className="review-list">
            {loading ? (
              <div className="review-list__loading">טוען תגובות...</div>
            ) : error ? (
              <div className="review-list__error">{error}</div>
            ) : reviews.length === 0 ? (
              <div className="review-list__empty">אין תגובות עדיין. היו הראשונים!</div>
            ) : (
              reviews.map((review) => (
                <ReviewItem
                  key={review.review_id}
                  review={review}
                  currentUser={user}
                  onDelete={removeReview}
                  onEdit={editReview}
                  onVote={voteReview}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}