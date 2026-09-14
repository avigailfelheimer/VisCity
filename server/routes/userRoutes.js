import express from 'express';
import { getAllUsers, getUser, putUser, deleteUser, postUsers, getUserPlaces, getUserReviewsList, getOnlineUsers } from '../controller/UserController.js';
import { authenticateToken, requireRole } from '../middleWare/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin'), getAllUsers);
router.get('/online', authenticateToken, requireRole('admin'), getOnlineUsers);
router.post('/', authenticateToken, requireRole('admin'), postUsers);
router.get('/:id', authenticateToken, getUser);
router.get('/:id/places', authenticateToken, getUserPlaces);
router.get('/:id/reviews', authenticateToken, getUserReviewsList);
router.put('/:id', authenticateToken, putUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;