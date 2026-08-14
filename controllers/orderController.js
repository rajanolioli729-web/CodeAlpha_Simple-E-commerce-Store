const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');

// POST /api/orders - Place a new order (requires login)
async function placeOrder(req, res) {
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Please log in to place an order' });
    }

    const { items } = req.body;

    // Validate that items array exists and is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
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
    let totalPrice = 0;

    for (const product of products) {
      const quantity = quantities[product.id];

      // Check if enough stock is available
      if (quantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.quantity} left.`
        });
      }

      totalPrice += product.price * quantity;
    }

    // Round the total to 2 decimal places
    totalPrice = Math.round(totalPrice * 100) / 100;

    // Create the order in the database
    const orderId = await orderModel.createOrder(req.session.userId, totalPrice);

    // Add each item to the order and update product stock
    for (const product of products) {
      const quantity = quantities[product.id];
      await orderModel.addOrderItem(orderId, product.id, quantity, product.price);

      // Reduce the product quantity in stock
      const newQuantity = product.quantity - quantity;
      await productModel.updateProductQuantity(product.id, newQuantity);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        totalPrice,
        orderDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
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

module.exports = {
  placeOrder,
  getUserOrders
};