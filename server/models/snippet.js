const pool = require('../db');

async function findAllByUser(userId) {
  const result = await pool.query(
    'SELECT id, title, code, created_at FROM snippets WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findById(id, userId) {
  const result = await pool.query(
    'SELECT id, title, code, created_at FROM snippets WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function create(userId, title, code) {
  const result = await pool.query(
    'INSERT INTO snippets (user_id, title, code) VALUES ($1, $2, $3) RETURNING id, title, code, created_at',
    [userId, title, code]
  );
  return result.rows[0];
}

async function remove(id, userId) {
  const result = await pool.query(
    'DELETE FROM snippets WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0] || null;
}

module.exports = { findAllByUser, findById, create, remove };
