import express from 'express';
import { postPlace, fetchPlaces, fetchPlaceById, putPlace, deletePlace } from '../controller/PlaceController.js';
import reviewRoutes from './reviewRoute.js';
import mediaRoutes from './mediaRoute.js';
import { authenticateToken, authorizeOwnership } from '../middleWare/authMiddleware.js';
import {getPlaceForAuthorization} from '../services/PlaceService.js';

const router = express.Router();

router.get('/', fetchPlaces);
router.get('/:id', fetchPlaceById);
router.post('/', authenticateToken, postPlace);
router.put('/:id', authenticateToken, 
    authorizeOwnership({
        getById: getPlaceForAuthorization,
        paramName: 'id',
        ownerField: 'created_by',
    }),
    putPlace
);

router.delete('/:id', authenticateToken,
    authorizeOwnership({
        getById: getPlaceForAuthorization,
        paramName: 'id',
        ownerField: 'created_by',
    }),
    deletePlace
);

router.use('/:placeId/reviews', reviewRoutes);
router.use('/:placeId/media', mediaRoutes);



export default router;

