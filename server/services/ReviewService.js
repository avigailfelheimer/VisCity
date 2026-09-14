import {
    createReview,
    getReviewsByPlaceId,
    getReviewsByUserId,
    getReviewById,
    updateReview,
    deleteReview,
    voteReviewHelpful,
    getStarredReviewByUserAndPlace,
} from '../models/ReviewModel.js';
import { REVIEW_NOT_FOUND, INVALID_RATING, DELETE_FAILED, CANNOT_VOTE_OWN_REVIEW, REVIEW_ALREADY_STARRED } from '../const/errorConst.js';

export const getReviewForAuthorization = async (id) => {
    return await getReviewById(id);
};

export const addReview = async (userId, placeId, rating, comment) => {
    // rating may be null/undefined → comment-only allowed
    if (rating !== undefined && rating !== null) {
        const numeric = Number(rating);
        if (isNaN(numeric) || numeric < 1 || numeric > 5) {
            const error = new Error(INVALID_RATING.message);
            error.status = INVALID_RATING.status;
            throw error;
        }

        // ensure user hasn't already posted a starred review for this place
        const existing = await getStarredReviewByUserAndPlace(userId, placeId);
        if (existing) {
            const error = new Error(REVIEW_ALREADY_STARRED.message);
            error.status = REVIEW_ALREADY_STARRED.status;
            throw error;
        }

        return await createReview(userId, placeId, numeric, comment);
    }

    // comment-only review
    return await createReview(userId, placeId, null, comment);
};

export const getPlaceReviews = async (placeId, currentUserId = null) => {
    return await getReviewsByPlaceId(placeId, currentUserId);
};

export const getUserReviews = async (userId) => {
    return await getReviewsByUserId(userId);
};

export const editReview = async (reviewId, rating, comment) => {
    const review = await getReviewForAuthorization(reviewId);
    if (!review) {
        const error = new Error(REVIEW_NOT_FOUND.message);
        error.status = REVIEW_NOT_FOUND.status;
        throw error;
    }

    // rating may be null (comment-only) or numeric
    if (rating !== undefined && rating !== null) {
        const numeric = Number(rating);
        if (isNaN(numeric) || numeric < 1 || numeric > 5) {
            const error = new Error(INVALID_RATING.message);
            error.status = INVALID_RATING.status;
            throw error;
        }

        // check if user already has a different starred review for this place
        const existing = await getStarredReviewByUserAndPlace(review.user_id, review.place_id, reviewId);
        if (existing) {
            const error = new Error(REVIEW_ALREADY_STARRED.message);
            error.status = REVIEW_ALREADY_STARRED.status;
            throw error;
        }
    }

    const success = await updateReview(reviewId, rating === undefined ? review.rating : rating, comment);
    if (!success) {
        const error = new Error('Failed to update review');
        error.status = 500;
        throw error;
    }

    return true;
};

export const removeReview = async (reviewId) => {
    const review = await getReviewForAuthorization(reviewId);
    if (!review) {
        const error = new Error(REVIEW_NOT_FOUND.message);
        error.status = REVIEW_NOT_FOUND.status;
        throw error;
    }

    const success = await deleteReview(reviewId);
    if (!success) {
        const error = new Error(DELETE_FAILED.message);
        error.status = DELETE_FAILED.status;
        throw error;
    }

    return true;
};

export const helpfulVote = async (reviewId, userId, vote) => {
    const review = await getReviewForAuthorization(reviewId);
    if (!review) {
        const error = new Error(REVIEW_NOT_FOUND.message);
        error.status = REVIEW_NOT_FOUND.status;
        throw error;
    }

    if (review.user_id === userId) {
        const error = new Error(CANNOT_VOTE_OWN_REVIEW.message);
        error.status = CANNOT_VOTE_OWN_REVIEW.status;
        throw error;
    }

    return await voteReviewHelpful(reviewId, userId, vote);
};
