import { addReview, getPlaceReviews, editReview, removeReview, helpfulVote } from '../services/ReviewService.js';

export const postReview = async (req, res, next) => {
    try {
        const placeId = req.params.placeId || req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        // rating is optional (allow comment-only). If provided, validation happens in service.
        const newReview = await addReview(userId, placeId, rating, comment);
        res.status(201).json(newReview);
    } catch (err) {
        next(err);
    }
};

export const getReviews = async (req, res, next) => {
    try {
        const placeId = req.params.placeId || req.params.id;
        // מעביר את ה-userId כדי שהשאילתה תדע מה הצביע המשתמש הנוכחי
        const currentUserId = req.user?.id ?? null;
        const reviews = await getPlaceReviews(placeId, currentUserId);
        res.status(200).json(reviews);
    } catch (err) {
        next(err);
    }
};

export const putReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        // rating optional on edit — service will validate and enforce single starred rule
        await editReview(reviewId, rating, comment);
        res.status(200).json({ success: true, message: 'Review updated successfully' });
    } catch (err) {
        next(err);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        await removeReview(reviewId);
        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const voteHelpful = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const { vote } = req.body; 

        if (vote !== 'up' && vote !== 'down' && vote !== null) {
            return res.status(400).json({ error: 'vote חייב להיות up, down או null' });
        }

        const result = await helpfulVote(reviewId, userId, vote);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};
