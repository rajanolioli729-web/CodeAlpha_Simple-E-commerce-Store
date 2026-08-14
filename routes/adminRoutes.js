const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All admin routes require admin role
router.use(requireAdmin);

// GET /api/admin/orders - Get all orders
router.get('/orders', adminController.getAllOrders);

// GET /api/admin/orders/:id - Get a single order
router.get('/orders/:id', adminController.getOrderById);

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;