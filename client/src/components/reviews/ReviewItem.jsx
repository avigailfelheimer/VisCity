import { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import ReviewForm from './ReviewForm';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewItem({ review, currentUser, onDelete, onEdit, onVote }) {
  const {
    review_id,
    user_id,
    username,
    rating,
    comment,
    created_at,
    helpful_count    = 0,
    not_helpful_count = 0,
    user_vote,
  } = review;

  const [isEditing, setIsEditing] = useState(false);

  const currentUserId = currentUser ? (currentUser.id ?? currentUser.user_id) : null;
  const isOwner = currentUserId != null && currentUserId === user_id;
  const createdDate = formatDate(created_at);

  if (isEditing) {
    return (
      <article className="review-item" dir="rtl">
        <ReviewForm
          label="עריכת תגובה"
          submitLabel="שמור שינויים"
          initialRating={rating}
          initialComment={comment || ''}
          onCancel={() => setIsEditing(false)}
          onSubmit={async (newRating, newComment) => {
            await onEdit(review_id, newRating, newComment);
            setIsEditing(false);
          }}
        />
      </article>
    );
  }

  return (
    <article className="review-item" dir="rtl">
      <div className="review-item__top">
        <div className="review-item__info">
          <span className="review-item__author">{username ?? 'אנונימי'}</span>
          {createdDate && <span className="review-item__date">{createdDate}</span>}
        </div>
        <div className="review-item__stars" aria-label={`דירוג ${rating} מתוך 5`}>
          {STARS.map((s) => (
            <span key={s} className={`review-star ${s <= rating ? 'review-star--filled' : ''}`}>★</span>
          ))}
        </div>
      </div>

      {comment && <p className="review-item__comment">{comment}</p>}

      <div className="review-item__footer">
        <span className="review-helpful-label">האם זה הועיל?</span>

        <div className="review-helpful-btns">
          <button
            className={`helpful-btn helpful-btn--up ${user_vote === 'up' ? 'helpful-btn--active' : ''}`}
            onClick={() => currentUser && !isOwner && onVote(review_id, 'up')}
            disabled={!currentUser || isOwner}
            title={!currentUser ? 'יש להתחבר' : isOwner ? 'לא ניתן להצביע על התגובה שלך' : 'הועיל לי'}
            aria-pressed={user_vote === 'up'}
          >
            👍 {helpful_count > 0 && <span>{helpful_count}</span>}
          </button>

          <button
            className={`helpful-btn helpful-btn--down ${user_vote === 'down' ? 'helpful-btn--active' : ''}`}
            onClick={() => currentUser && !isOwner && onVote(review_id, 'down')}
            disabled={!currentUser || isOwner}
            title={!currentUser ? 'יש להתחבר' : isOwner ? 'לא ניתן להצביע על התגובה שלך' : 'לא הועיל לי'}
            aria-pressed={user_vote === 'down'}
          >
            👎 {not_helpful_count > 0 && <span>{not_helpful_count}</span>}
          </button>
        </div>

        {(isOwner || (currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin1'))) && (
          <div className="review-owner-actions">
            <button
              className="review-edit-btn"
              onClick={() => setIsEditing(true)}
              aria-label="ערוך תגובה"
            >
              ערוך
            </button>
            <button
              className="review-delete-btn"
              onClick={() => onDelete(review_id)}
              aria-label="מחק תגובה"
            >
              מחק
            </button>
          </div>
        )}
      </div>
    </article>
  );
}