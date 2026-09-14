import express from 'express';
import {
    postReview,
    getReviews,
    putReview,
    deleteReview,
    voteHelpful,
} from '../controller/ReviewController.js';

import { authenticateToken, authorizeOwnership } from '../middleWare/authMiddleware.js';
import { getReviewForAuthorization } from '../services/ReviewService.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);

router.post('/', authenticateToken, postReview);

router.put('/:reviewId',
    authenticateToken,
    authorizeOwnership({
        getById: getReviewForAuthorization,
        paramName: 'reviewId',
        ownerField: 'user_id'
    }),
    putReview
);

router.delete('/:reviewId',
    authenticateToken,
    authorizeOwnership({
        getById: getReviewForAuthorization,
        paramName: 'reviewId',
        ownerField: 'user_id'
    }),
    deleteReview
);

router.post('/:reviewId/helpful', authenticateToken, voteHelpful);

export default router;
