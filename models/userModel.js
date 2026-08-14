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
    'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};