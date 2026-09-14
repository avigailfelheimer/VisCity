import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { create, getUserByEmail } from '../models/UserModel.js';
import { create as createPassword, getPasswordByUserId } from '../models/PasswordModel.js';
import {
    USER_NOT_FOUND,
    INCORRECT_PASSWORD,
    EMAIL_ALREADY_IN_USE,
    DB_NO_PASSWORD_RECORD } from '../const/errorConst.js';

const SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        SECRET,
        { expiresIn: '7d' }
    );
};

export const login = async (email, password) => {
    const user = await getUserByEmail(email);
    if (!user) {
        const error = new Error(USER_NOT_FOUND.message);
        error.status = USER_NOT_FOUND.status;
        throw error;
    }

    const pass = await getPasswordByUserId(user.id);
    if (!pass) {
        console.error(`Database inconsistency: User ID ${user.id} has no password record.`);
        const error = new Error(DB_NO_PASSWORD_RECORD.message);
        error.status = DB_NO_PASSWORD_RECORD.status;
        throw error;
    }

    const isPasswordMatch = await bcrypt.compare(password, pass.password_hash);
    if (!isPasswordMatch) {
        const error = new Error(INCORRECT_PASSWORD.message);
        error.status = INCORRECT_PASSWORD.status;
        throw error;
    }

    const token = generateToken(user);
    return { user, token };
};

export const register = async (userName, email, password) => {
    const existing = await getUserByEmail(email);
    if (existing) {
        const error = new Error(EMAIL_ALREADY_IN_USE.message);
        error.status = EMAIL_ALREADY_IN_USE.status;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await create(userName, email);
    await createPassword(newUser.id, hashedPassword);

    const token = generateToken(newUser);
    return { user: newUser, token };
};