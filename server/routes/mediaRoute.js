import express from 'express';
import { postMedia, fetchMedia, deleteMediaItem } from '../controller/MediaController.js';
import { authenticateToken } from '../middleWare/authMiddleware.js';
import upload, { handleUploadError } from '../middleWare/uploadMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authenticateToken, upload.single('file'), handleUploadError, postMedia);
router.get('/', fetchMedia);
router.delete('/:mediaId', authenticateToken, deleteMediaItem);

export default router;