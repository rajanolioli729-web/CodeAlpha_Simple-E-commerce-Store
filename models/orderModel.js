const pool = require('../database/db');

// Create a new order and return its ID
async function createOrder(userId, totalPrice) {
  const [result] = await pool.query(
    'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
    [userId, totalPrice]
  );
  return result.insertId;
}

// Add an item to an order
async function addOrderItem(orderId, productId, quantity, price) {
  const [result] = await pool.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
    [orderId, productId, quantity, price]
  );
  return result.insertId;
}

// Get all orders for a specific user
async function getOrdersByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
    [userId]
  );
  return rows;
}

// Get all items for a specific order
async function getOrderItems(orderId) {
  const [rows] = await pool.query(
    `SELECT oi.*, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
}

module.exports = {
  createOrder,
  addOrderItem,
  getOrdersByUser,
  getOrderItems
};