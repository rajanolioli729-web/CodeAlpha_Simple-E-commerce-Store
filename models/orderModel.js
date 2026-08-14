const pool = require('../database/db');

// Create a new order and return its ID
async function createOrder(userId, orderData, connection = null) {
  const db = connection || pool;
  const { totalAmount, status, shippingName, shippingEmail, shippingPhone, shippingAddress, shippingCity, postalCode } = orderData;
  const [result] = await db.query(
    `INSERT INTO orders (user_id, total_amount, status, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, postal_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, totalAmount, status, shippingName, shippingEmail, shippingPhone, shippingAddress, shippingCity, postalCode]
  );
  return result.insertId;
}

// Add an item to an order
async function addOrderItem(orderId, productId, quantity, price, connection = null) {
  const db = connection || pool;
  const [result] = await db.query(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
    [orderId, productId, quantity, price]
  );
  return result.insertId;
}

// Get all orders for a specific user
async function getOrdersByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

// Get all items for a specific order
async function getOrderItems(orderId) {
  const [rows] = await pool.query(
    `SELECT oi.*, p.name, p.image
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
}

// Get a single order by ID
async function getOrderById(orderId) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  return rows[0];
}

// Get all orders (admin)
async function getAllOrders() {
  const [rows] = await pool.query(
    `SELECT o.*, u.full_name, u.email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  );
  return rows;
}

// Update order status (admin)
async function updateOrderStatus(orderId, status) {
  const [result] = await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId]
  );
  return result.affectedRows > 0;
}

// Update product stock within a transaction
async function updateProductStock(productId, newStock, connection = null) {
  const db = connection || pool;
  const [result] = await db.query(
    'UPDATE products SET stock = ? WHERE id = ?',
    [newStock, productId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createOrder,
  addOrderItem,
  getOrdersByUser,
  getOrderItems,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateProductStock
};