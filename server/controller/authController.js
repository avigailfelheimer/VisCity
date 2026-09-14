import { login , register } from '../services/authService.js';

export const postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await login(email, password);
        res.json({ success: true, user, token });
    } catch (err) {
        next(err);
    }
};

export const postRegister = async (req, res, next) => {
    try {
        const { userName, email, password } = req.body;
        const { user, token } = await register(userName, email, password);
        res.status(201).json({ user, token });
    } catch (err) {
        next(err);
    }
};