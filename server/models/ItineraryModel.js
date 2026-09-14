import pool from '../config/db.js';

/**
 * שליפת המועדפים של המשתמש — כולל פרטי תצוגה (תמונה, דירוג, תיקייה)
 */
export const getItineraryByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            f.favorite_id,
            f.order_index,
            f.folder_id,
            f.created_at,
            p.place_id,
            p.name,
            p.description,
            p.categories,
            p.latitude,
            p.longitude,
            p.opening_hours,
            p.is_approved,
            u.username AS created_by_username,
            (SELECT m.media_url FROM media m
              WHERE m.place_id = p.place_id AND m.media_type = 'image'
              ORDER BY m.uploaded_at DESC LIMIT 1) AS image_url,
            (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.place_id = p.place_id) AS avg_rating,
            (SELECT COUNT(*) FROM reviews r WHERE r.place_id = p.place_id) AS review_count
         FROM favorites f
         JOIN places p ON f.place_id = p.place_id
         LEFT JOIN users u ON p.created_by = u.user_id
         WHERE f.user_id = ?
         ORDER BY f.favorite_id DESC`,
        [userId]
    );

    // MySQL מחזיר JSON columns כ-string — נמיר למערך
    return rows.map((row) => ({
        ...row,
        categories: typeof row.categories === 'string' ? JSON.parse(row.categories) : row.categories,
    }));
};

/**
 * הוספת מקום למסלול — order_index = הסוף (max + 1)
 */
export const addToItinerary = async (userId, placeId) => {
    const [[{ maxOrder }]] = await pool.query(
        `SELECT COALESCE(MAX(order_index), -1) AS maxOrder
         FROM favorites
         WHERE user_id = ?`,
        [userId]
    );

    const [result] = await pool.query(
        `INSERT INTO favorites (user_id, place_id, order_index)
         VALUES (?, ?, ?)`,
        [userId, placeId, maxOrder + 1]
    );

    return {
        favorite_id: result.insertId,
        user_id: userId,
        place_id: placeId,
        order_index: maxOrder + 1
    };
};

/**
 * בדיקה אם מקום כבר קיים במסלול
 */
export const getItineraryEntry = async (userId, placeId) => {
    const [rows] = await pool.query(
        `SELECT favorite_id, user_id, place_id, order_index
         FROM favorites
         WHERE user_id = ? AND place_id = ?`,
        [userId, placeId]
    );
    return rows[0] || null;
};

/**
 * שליפת רשומה יחידה לפי favorite_id (לצורך בדיקת בעלות)
 */
export const getItineraryEntryById = async (favoriteId) => {
    const [rows] = await pool.query(
        `SELECT favorite_id, user_id, place_id, order_index
         FROM favorites
         WHERE favorite_id = ?`,
        [favoriteId]
    );
    return rows[0] || null;
};

/**
 * הסרת מקום מהמסלול לפי favorite_id
 */
export const removeFromItinerary = async (favoriteId) => {
    const [result] = await pool.query(
        `DELETE FROM favorites
         WHERE favorite_id = ?`,
        [favoriteId]
    );
    return result.affectedRows > 0;
};

/**
 * עדכון התיקייה של מועדף קיים (folderId = null מוציא אותו מכל תיקייה)
 */
export const updateFavoriteFolder = async (favoriteId, folderId) => {
    const [result] = await pool.query(
        `UPDATE favorites
         SET folder_id = ?
         WHERE favorite_id = ?`,
        [folderId, favoriteId]
    );
    return result.affectedRows > 0;
};

/**
 * עדכון סדר המסלול — מקבל מערך של { favorite_id, order_index }
 * מבצע את כל העדכונים בטרנזקציה אחת
 */
export const reorderItinerary = async (userId, entries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const { favorite_id, order_index } of entries) {
            await connection.query(
                `UPDATE favorites
                 SET order_index = ?
                 WHERE favorite_id = ? AND user_id = ?`,
                [order_index, favorite_id, userId]
            );
        }

        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};
