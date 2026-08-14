const pool = require('../database/db');

// Get all products from the database
async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  return rows;
}

// Get a single product by its ID
async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

// Get multiple products by their IDs (used for cart/order validation)
async function getProductsByIds(ids) {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(`SELECT * FROM products WHERE id IN (${placeholders})`, ids);
  return rows;
}

// Update product quantity after an order is placed
async function updateProductQuantity(id, newQuantity) {
  const [result] = await pool.query(
    'UPDATE products SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByIds,
  updateProductQuantity
};