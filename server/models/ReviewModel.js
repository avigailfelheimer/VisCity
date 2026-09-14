import pool from '../config/db.js';

/**
 * הוספת תגובה חדשה לפלייס
 */
export const createReview = async (userId, placeId, rating, comment) => {
    const [result] = await pool.query(
        `INSERT INTO reviews (user_id, place_id, rating, comment)
         VALUES (?, ?, ?, ?)`,
        [userId, placeId, rating, comment || null]
    );
   const [[user]] = await pool.query(
        `SELECT username
         FROM users
         WHERE user_id = ?`,
        [userId]
    );

    return {
        review_id: result.insertId,
        user_id: userId,
        username: user.username,
        place_id: placeId,
        rating,
        comment: comment || null,
        created_at: new Date()
    };
};

/**
 * קבלת כל התגובות לפלייס — כולל ספירות helpful והצבעת המשתמש הנוכחי
 */
export const getReviewsByPlaceId = async (placeId, currentUserId = null) => {
    const [rows] = await pool.query(
        `SELECT
            r.review_id,
            r.user_id,
            r.place_id,
            r.rating,
            r.comment,
            r.created_at,
            u.username,
            COALESCE(h_up.cnt,  0)  AS helpful_count,
            COALESCE(h_dn.cnt,  0)  AS not_helpful_count,
            rh.vote                  AS user_vote
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.user_id
         LEFT JOIN (
             SELECT review_id, COUNT(*) AS cnt
             FROM review_helpful
             WHERE vote = 'up'
             GROUP BY review_id
         ) h_up ON h_up.review_id = r.review_id
         LEFT JOIN (
             SELECT review_id, COUNT(*) AS cnt
             FROM review_helpful
             WHERE vote = 'down'
             GROUP BY review_id
         ) h_dn ON h_dn.review_id = r.review_id
         LEFT JOIN review_helpful rh
             ON rh.review_id = r.review_id AND rh.user_id = ?
         WHERE r.place_id = ?
         ORDER BY r.created_at DESC`,
        [currentUserId, placeId]
    );
    return rows;
};

/**
 * קבלת כל התגובות שכתב משתמש מסוים — כולל שם המקום
 */
export const getReviewsByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT
            r.review_id,
            r.user_id,
            r.place_id,
            r.rating,
            r.comment,
            r.created_at,
            p.name AS place_name
         FROM reviews r
         LEFT JOIN places p ON r.place_id = p.place_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * קבלת תגובה ספציפית לפי ID
 */
export const getReviewById = async (reviewId) => {
    const [rows] = await pool.query(
        `SELECT r.review_id, r.user_id, r.place_id, r.rating, r.comment, 
                r.created_at, u.username
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.user_id
         WHERE r.review_id = ?`,
        [reviewId]
    );
    return rows[0] || null;
};

/**
 * עדכון תגובה קיימת
 */
export const updateReview = async (reviewId, rating, comment) => {
    const [result] = await pool.query(
        `UPDATE reviews
         SET rating = ?, comment = ?
         WHERE review_id = ?`,
        [rating, comment || null, reviewId]
    );
    return result.affectedRows > 0;
};

/**
 * מחיקת תגובה
 */
export const deleteReview = async (reviewId) => {
    const [result] = await pool.query(
        `DELETE FROM reviews
         WHERE review_id = ?`,
        [reviewId]
    );
    return result.affectedRows > 0;
};

/**
 * הצבעת helpful — הוספה / החלפה / ביטול
 * מחזיר ספירות עדכניות + user_vote
 */
export const voteReviewHelpful = async (reviewId, userId, vote) => {
    if (vote === null) {
        await pool.query(
            `DELETE FROM review_helpful WHERE review_id = ? AND user_id = ?`,
            [reviewId, userId]
        );
    } else {
        await pool.query(
            `INSERT INTO review_helpful (review_id, user_id, vote)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE vote = VALUES(vote)`,
            [reviewId, userId, vote]
        );
    }

    const [rows] = await pool.query(
        `SELECT
            SUM(vote = 'up')   AS helpful_count,
            SUM(vote = 'down') AS not_helpful_count
         FROM review_helpful
         WHERE review_id = ?`,
        [reviewId]
    );

    return {
        helpful_count:     Number(rows[0].helpful_count     ?? 0),
        not_helpful_count: Number(rows[0].not_helpful_count ?? 0),
        user_vote:         vote,
    };
};

/**
 * מציאת ביקורת עם דירוג (rating IS NOT NULL) עבור משתמש ומקום
 * אם provided excludeReviewId — מחזירים רק אם יש ביקורת שונה מה- exclude
 */
export const getStarredReviewByUserAndPlace = async (userId, placeId, excludeReviewId = null) => {
    let sql = `SELECT review_id, user_id, place_id, rating, comment, created_at
               FROM reviews
               WHERE user_id = ? AND place_id = ? AND rating IS NOT NULL`;
    const params = [userId, placeId];
    if (excludeReviewId) {
        sql += ` AND review_id != ?`;
        params.push(excludeReviewId);
    }
    sql += ` LIMIT 1`;

    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
};