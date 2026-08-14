const pool = require('../database/db');

// Get all products with optional search and category filter
async function getAllProducts(search = '', category = '') {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY id DESC';
  const [rows] = await pool.query(query, params);
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
async function updateProductQuantity(id, newQuantity, connection = null) {
  const db = connection || pool;
  const [result] = await db.query(
    'UPDATE products SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  return result.affectedRows > 0;
}

// Get all distinct categories
async function getCategories() {
  const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
  return rows.map((row) => row.category);
}

// Create a new product (admin)
async function createProduct({ name, description, price, image, category, stock }) {
  const [result] = await pool.query(
    'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, image, category, stock]
  );
  return result.insertId;
}

// Update an existing product (admin)
async function updateProduct(id, { name, description, price, image, category, stock }) {
  const [result] = await pool.query(
    'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ? WHERE id = ?',
    [name, description, price, image, category, stock, id]
  );
  return result.affectedRows > 0;
}

// Delete a product (admin)
async function deleteProduct(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByIds,
  updateProductQuantity,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};