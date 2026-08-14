const orderModel = require('../models/orderModel');

// GET /api/admin/orders - Get all orders (admin)
async function getAllOrders(req, res) {
  try {
    const orders = await orderModel.getAllOrders();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
}

// GET /api/admin/orders/:id - Get a single order with items (admin)
async function getOrderById(req, res) {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = await orderModel.getOrderItems(orderId);
    res.json({ success: true, order: { ...order, items } });
  } catch (error) {
    console.error('Admin fetch order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
}

// PUT /api/admin/orders/:id/status - Update order status (admin)
async function updateOrderStatus(req, res) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const updated = await orderModel.updateOrderStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus
};