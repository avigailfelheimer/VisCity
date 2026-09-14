import express from 'express';
import {
    fetchItinerary,
    postItineraryPlace,
    deleteItineraryPlace,
    patchItineraryFolder,
} from '../controller/ItineraryController.js';
import {
    fetchFolders,
    postFolder,
    patchFolder,
    removeFolder,
} from '../controller/FolderController.js';
import { authenticateToken } from '../middleWare/authMiddleware.js';

const router = express.Router();

router.get('/folders', authenticateToken, fetchFolders);
router.post('/folders', authenticateToken, postFolder);
router.patch('/folders/:folderId', authenticateToken, patchFolder);
router.delete('/folders/:folderId', authenticateToken, removeFolder);

router.get('/', authenticateToken, fetchItinerary);
router.post('/', authenticateToken, postItineraryPlace);
router.patch('/:favoriteId', authenticateToken, patchItineraryFolder);
router.delete('/:favoriteId', authenticateToken, deleteItineraryPlace);

export default router;
