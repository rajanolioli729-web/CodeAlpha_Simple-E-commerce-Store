const pool = require('../database/db');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');

// POST /api/orders - Place a new order (requires login)
async function placeOrder(req, res) {
  let connection;
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Please log in to place an order' });
    }

    const { items, shipping } = req.body;

    // Validate that items array exists and is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate shipping information
    if (!shipping || !shipping.name || !shipping.email || !shipping.phone ||
        !shipping.address || !shipping.city || !shipping.postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide complete shipping information' });
    }

    // Extract product IDs and validate quantities
    const productIds = [];
    const quantities = {};

    for (const item of items) {
      const productId = parseInt(item.productId, 10);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product in cart' });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid quantity in cart' });
      }

      productIds.push(productId);
      quantities[productId] = quantity;
    }

    // Fetch the products from the database to get real prices
    const products = await productModel.getProductsByIds(productIds);

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products no longer exist' });
    }

    // Calculate the total price on the server (never trust frontend prices)
    let totalAmount = 0;

    for (const product of products) {
      const quantity = quantities[product.id];

      // Check if enough stock is available
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`
        });
      }

      totalAmount += parseFloat(product.price) * quantity;
    }

    // Round the total to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Begin transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Create the order within the transaction
    const orderId = await orderModel.createOrder(req.session.userId, {
      totalAmount,
      status: 'Pending',
      shippingName: shipping.name,
      shippingEmail: shipping.email,
      shippingPhone: shipping.phone,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      postalCode: shipping.postalCode
    }, connection);

    // Add each item to the order and update product stock within the transaction
    for (const product of products) {
      const quantity = quantities[product.id];
      await orderModel.addOrderItem(orderId, product.id, quantity, product.price, connection);

      // Reduce the product stock
      const newStock = product.stock - quantity;
      await productModel.updateProductQuantity(product.id, newStock, connection);
    }

    // Commit the transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Your order has been placed successfully.',
      order: {
        id: orderId,
        totalAmount,
        orderDate: new Date().toISOString()
      }
    });
  } catch (error) {
    // Rollback the transaction on error
    if (connection) {
      await connection.rollback();
    }
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// GET /api/orders - Get all orders for the logged-in user
async function getUserOrders(req, res) {
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Please log in to view your orders' });
    }

    const orders = await orderModel.getOrdersByUser(req.session.userId);

    // Fetch items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const items = await orderModel.getOrderItems(order.id);
      ordersWithItems.push({ ...order, items });
    }

    res.json({ success: true, orders: ordersWithItems });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
}

// GET /api/orders/:id - Get a single order by ID (ownership verified)
async function getOrderById(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Please log in to view this order' });
    }

    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership - users can only access their own orders
    if (order.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const items = await orderModel.getOrderItems(orderId);
    res.json({ success: true, order: { ...order, items } });
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
}

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById
};