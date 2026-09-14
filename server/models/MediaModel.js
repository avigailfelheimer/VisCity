import pool from '../config/db.js';

/**
 * שמירת רשומת מדיה חדשה ב-DB לאחר העלאת הקובץ
 */
export const createMedia = async (placeId, userId, mediaType, mediaUrl) => {
    const [result] = await pool.query(
        `INSERT INTO media (place_id, user_id, media_type, media_url)
         VALUES (?, ?, ?, ?)`,
        [placeId, userId, mediaType, mediaUrl]
    );
    return {
        media_id: result.insertId,
        place_id: placeId,
        user_id: userId,
        media_type: mediaType,
        media_url: mediaUrl,
        uploaded_at: new Date()
    };
};

/**
 * שליפת כל קבצי המדיה של מקום
 */
export const getMediaByPlaceId = async (placeId) => {
    const [rows] = await pool.query(
        `SELECT
            m.media_id,
            m.place_id,
            m.user_id,
            m.media_type,
            m.media_url,
            m.uploaded_at,
            u.username AS uploaded_by
         FROM media m
         LEFT JOIN users u ON m.user_id = u.user_id
         WHERE m.place_id = ?
         ORDER BY m.uploaded_at DESC`,
        [placeId]
    );
    return rows;
};

/**
 * שליפת רשומת מדיה יחידה לפי ID (לצורך בדיקת בעלות)
 */
export const getMediaById = async (mediaId) => {
    const [rows] = await pool.query(
        `SELECT media_id, place_id, user_id, media_type, media_url, uploaded_at
         FROM media
         WHERE media_id = ?`,
        [mediaId]
    );
    return rows[0] || null;
};

/**
 * מחיקת רשומת מדיה — הקובץ עצמו נמחק בשכבת הסרוויס
 */
export const deleteMedia = async (mediaId) => {
    const [result] = await pool.query(
        `DELETE FROM media
         WHERE media_id = ?`,
        [mediaId]
    );
    return result.affectedRows > 0;
};
