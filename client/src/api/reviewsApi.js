import { getData, create, update, deleteItem } from './client';

export const getReviews = async (placeId) => {
  if (!placeId) {
    throw new Error('getReviews: missing placeId');
  }

  const path = `/places/${encodeURIComponent(placeId)}/reviews`;
  return getData(path); // מערך של reviews
};

export const createReview = (placeId, reviewData, token) =>
  create(`/places/${encodeURIComponent(placeId)}/reviews`, reviewData, token);

export const updateReview = (placeId, reviewId, reviewData, token) =>
  update(
    `/places/${encodeURIComponent(placeId)}/reviews/${encodeURIComponent(reviewId)}`,
    reviewData,
    token
  );

export const deleteReview = (placeId, reviewId, token) =>
  deleteItem(
    `/places/${encodeURIComponent(placeId)}/reviews/${encodeURIComponent(reviewId)}`,
    token
  );

export const voteReviewHelpful = (placeId, reviewId, vote, token) =>
  create(
    `/places/${encodeURIComponent(placeId)}/reviews/${encodeURIComponent(reviewId)}/helpful`,
    { vote },
    token
  );