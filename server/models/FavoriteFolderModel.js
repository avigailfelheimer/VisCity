import pool from '../config/db.js';

/**
 * שליפת כל התיקיות של משתמש, מסודרות לפי תאריך יצירה
 */
export const getFoldersByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT folder_id, name, created_at
         FROM favorite_folders
         WHERE user_id = ?
         ORDER BY created_at ASC, folder_id ASC`,
        [userId]
    );
    return rows;
};

/**
 * שליפת תיקייה בודדת לפי ID (לבדיקת בעלות)
 */
export const getFolderById = async (folderId) => {
    const [rows] = await pool.query(
        `SELECT folder_id, user_id, name, created_at
         FROM favorite_folders
         WHERE folder_id = ?`,
        [folderId]
    );
    return rows[0] || null;
};

/**
 * יצירת תיקייה חדשה
 */
export const createFolder = async (userId, name) => {
    const [result] = await pool.query(
        `INSERT INTO favorite_folders (user_id, name)
         VALUES (?, ?)`,
        [userId, name]
    );
    return { folder_id: result.insertId, user_id: userId, name };
};

/**
 * שינוי שם תיקייה
 */
export const renameFolder = async (folderId, name) => {
    const [result] = await pool.query(
        `UPDATE favorite_folders
         SET name = ?
         WHERE folder_id = ?`,
        [name, folderId]
    );
    return result.affectedRows > 0;
};

/**
 * מחיקת תיקייה.
 * המועדפים ששובצו בתיקייה הזו עוברים ל"ללא תיקייה" (folder_id = NULL)
 * לפני המחיקה, כדי שהמידע יישאר תקין גם אם אין אילוץ FK פעיל ב-DB.
 */
export const deleteFolder = async (folderId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            `UPDATE favorites SET folder_id = NULL WHERE folder_id = ?`,
            [folderId]
        );

        const [result] = await connection.query(
            `DELETE FROM favorite_folders WHERE folder_id = ?`,
            [folderId]
        );

        await connection.commit();
        return result.affectedRows > 0;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};
