import { useState, useEffect } from 'react';
import { getReviews, createReview, updateReview, deleteReview, voteReviewHelpful } from '../api/reviewsApi';

export function useReviews(placeId, user) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getReviews(placeId);
        const mapped = (data ?? []).map((r) => ({ ...r, user_vote: r.user_vote ?? null }));
        setReviews(mapped);
      } catch {
        setError('לא ניתן לטעון תגובות. אנא נסו שוב.');
      } finally {
        setLoading(false);
      }
    };
    if (placeId) fetchReviews();
  }, [placeId]);

  // id of the user's starred review for this place (rating != null)
  const starredReviewId = (() => {
    if (!user) return null;
    const myId = user.id ?? user.user_id;
    const me = reviews.find(r => r.user_id === myId && r.rating !== null && r.rating !== undefined && r.rating > 0);
    return me ? me.review_id : null;
  })();

  const addReview = async (rating, comment) => {
    const payloadRating = rating ? rating : null;
    const newReview = await createReview(placeId, { rating: payloadRating, comment }, user.token);
    setReviews((prev) => [
      { ...newReview, username: newReview.username ?? user.username, user_vote: null },
      ...prev,
    ]);
  };

  const editReview = async (reviewId, rating, comment) => {
    const payloadRating = rating ? rating : null;
    await updateReview(placeId, reviewId, { rating: payloadRating, comment }, user.token);
    setReviews((prev) => prev.map((r) =>
      r.review_id === reviewId ? { ...r, rating, comment } : r
    ));
  };

  const removeReview = async (reviewId) => {
    await deleteReview(placeId, reviewId, user.token);
    setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
  };

  const voteReview = async (reviewId, vote) => {
    const review = reviews.find((r) => r.review_id === reviewId);
    if (!review) return;

    const newVote = review.user_vote === vote ? null : vote;
    
    // עדכון אופטימיסטי ל-UI
    setReviews((prev) => prev.map((r) => {
      if (r.review_id !== reviewId) return r;
      let helpful = r.helpful_count ?? 0;
      let notHelpful = r.not_helpful_count ?? 0;
      if (r.user_vote === 'up') helpful = Math.max(0, helpful - 1);
      if (r.user_vote === 'down') notHelpful = Math.max(0, notHelpful - 1);
      if (newVote === 'up') helpful += 1;
      if (newVote === 'down') notHelpful += 1;
      return { ...r, helpful_count: helpful, not_helpful_count: notHelpful, user_vote: newVote };
    }));

    try {
      const result = await voteReviewHelpful(placeId, reviewId, newVote, user.token);
      setReviews((prev) => prev.map((r) => r.review_id === reviewId ? { ...r, ...result } : r));
    } catch {
      // חזרה למצב הקודם במקרה של שגיאה
      setReviews((prev) => prev.map((r) => r.review_id === reviewId ? review : r));
    }
  };

  return { reviews, loading, error, starredReviewId, addReview, editReview, removeReview, voteReview };
}