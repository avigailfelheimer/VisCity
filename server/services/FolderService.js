import {
    getFoldersByUserId,
    getFolderById,
    createFolder as createFolderModel,
    renameFolder as renameFolderModel,
    deleteFolder as deleteFolderModel,
} from '../models/FavoriteFolderModel.js';
import {
    FOLDER_NOT_FOUND,
    FOLDER_NAME_REQUIRED,
    UNAUTHORIZED_FOLDER_MODIFICATION,
} from '../const/errorConst.js';

/**
 * שליפת כל התיקיות של המשתמש
 */
export const getFolders = async (userId) => {
    return await getFoldersByUserId(userId);
};

/**
 * יצירת תיקייה חדשה
 */
export const createFolder = async (userId, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        const error = new Error(FOLDER_NAME_REQUIRED.message);
        error.status = FOLDER_NAME_REQUIRED.status;
        throw error;
    }

    return await createFolderModel(userId, trimmed);
};

/**
 * מוודא שהתיקייה קיימת ושייכת למשתמש
 */
const ensureFolderOwnership = async (userId, folderId) => {
    const folder = await getFolderById(folderId);
    if (!folder) {
        const error = new Error(FOLDER_NOT_FOUND.message);
        error.status = FOLDER_NOT_FOUND.status;
        throw error;
    }

    if (folder.user_id !== userId) {
        const error = new Error(UNAUTHORIZED_FOLDER_MODIFICATION.message);
        error.status = UNAUTHORIZED_FOLDER_MODIFICATION.status;
        throw error;
    }

    return folder;
};

/**
 * שינוי שם תיקייה
 */
export const renameFolder = async (userId, folderId, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        const error = new Error(FOLDER_NAME_REQUIRED.message);
        error.status = FOLDER_NAME_REQUIRED.status;
        throw error;
    }

    await ensureFolderOwnership(userId, folderId);
    return await renameFolderModel(folderId, trimmed);
};

/**
 * מחיקת תיקייה (המועדפים בה עוברים ל"ללא תיקייה")
 */
export const deleteFolder = async (userId, folderId) => {
    await ensureFolderOwnership(userId, folderId);
    return await deleteFolderModel(folderId);
};

export { ensureFolderOwnership };
