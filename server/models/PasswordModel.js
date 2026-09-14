import pool from '../config/db.js';

export const getPasswordByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT password_hash
         FROM credentials
         WHERE user_id = ?`,
        [userId]
    );
    return rows[0] || null;
};

export const create = async (userId, passwordHash) => {
    await pool.query(
        `INSERT INTO credentials (user_id, password_hash)
         VALUES (?, ?)`,
        [userId, passwordHash]
    );
};