import * as UserService from '../services/UserService.js';
import { getPlaces } from '../services/PlaceService.js';
import { getUserReviews } from '../services/ReviewService.js';
import { ACCESS_DENIED } from '../const/errorConst.js';
import { getConnectedUsers } from '../services/socketManager.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        // allow admin (including special username) or owner
        const isAdmin = req.user.role === 'admin' || req.user.username === 'admin1';
        if (!isAdmin && req.user.id !== numericId) {
            return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });
        }
        const user = await UserService.getUserById(numericId);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

export const getUserPlaces = async (req, res, next) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        // allow admin (including special username) or owner
        const isAdmin = req.user.role === 'admin' || req.user.username === 'admin1';
        if (!isAdmin && req.user.id !== numericId) {
            return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });
        }
        const result = await getPlaces({ created_by: numericId, limit: 50 });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const getUserReviewsList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        // allow admin (including special username) or owner
        const isAdmin = req.user.role === 'admin' || req.user.username === 'admin1';
        if (!isAdmin && req.user.id !== numericId) {
            return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });
        }
        const reviews = await getUserReviews(numericId);
        res.status(200).json(reviews);
    } catch (err) {
        next(err);
    }
};

export const putUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        // only owner or admin (including special username)
        const isAdmin = req.user.role === 'admin' || req.user.username === 'admin1';
        if (!isAdmin && req.user.id !== numericId) {
            return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });
        }
        const { username, email, role } = req.body;

        // only admin can change role
        if (role !== undefined && !isAdmin) {
            return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });
        }

        await UserService.updateUser(numericId, { username, email, role });
        res.status(200).json({ success: true, message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        // only admin via requireRole, but prevent deleting self
        if (req.user.id === numericId) {
            return res.status(ACCESS_DENIED.status).json({ error: ACCESS_DENIED.message });
        }
        await UserService.deleteUser(numericId);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

export const postUsers = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email and password are required' });
        }
        const newUser = await UserService.createUser({ username, email, password, role });
        res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        next(err);
    }
};

export const getOnlineUsers = async (req, res, next) => {
    try {
        const users = getConnectedUsers();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};
