const pool = require('../database/db');

// Create a new user in the database
async function createUser(fullName, email, hashedPassword) {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
    [fullName, email, hashedPassword]
  );
  return result.insertId;
}

// Find a user by their email address
async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

// Find a user by their ID
async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Get user profile with order count
async function getUserProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.created_at,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
     FROM users u WHERE u.id = ?`,
    [userId]
  );
  return rows[0];
}

// Get recent orders for a user (for profile page)
async function getUserRecentOrders(userId, limit = 5) {
  const [rows] = await pool.query(
    'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getUserProfile,
  getUserRecentOrders
};