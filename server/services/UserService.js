import { getUserById as dbGetUserById, getAllUsers as dbGetAllUsers, updateUser as dbUpdateUser, deleteUserById as dbDeleteUser, create as dbCreateUser, getUserByEmail as dbGetUserByEmail } from '../models/UserModel.js';
import { create as dbCreatePassword } from '../models/PasswordModel.js';
import { USER_NOT_FOUND, EMAIL_ALREADY_IN_USE } from '../const/errorConst.js';
import bcrypt from 'bcrypt';

export const getUserById = async (id) => {
    const user = await dbGetUserById(id);
    if (!user) {
        const err = new Error(USER_NOT_FOUND.message);
        err.status = USER_NOT_FOUND.status;
        throw err;
    }
    return user;
};

export const getAllUsers = async () => {
    return await dbGetAllUsers();
};

export const createUser = async ({ username, email, password, role = 'user' }) => {
    const existing = await dbGetUserByEmail(email);
    if (existing) {
        const err = new Error(EMAIL_ALREADY_IN_USE.message);
        err.status = EMAIL_ALREADY_IN_USE.status;
        throw err;
    }
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await dbCreateUser(username, email, role);
    await dbCreatePassword(newUser.id, hashedPassword);
    return newUser;
};

export const updateUser = async (id, data) => {
    const exists = await dbGetUserById(id);
    if (!exists) {
        const err = new Error(USER_NOT_FOUND.message);
        err.status = USER_NOT_FOUND.status;
        throw err;
    }
    const ok = await dbUpdateUser(id, data);
    return ok;
};

export const deleteUser = async (id) => {
    const exists = await dbGetUserById(id);
    if (!exists) {
        const err = new Error(USER_NOT_FOUND.message);
        err.status = USER_NOT_FOUND.status;
        throw err;
    }
    const ok = await dbDeleteUser(id);
    return ok;
};
