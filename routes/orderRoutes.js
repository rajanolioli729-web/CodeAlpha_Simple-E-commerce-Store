const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Place a new order (requires login)
router.post('/', orderController.placeOrder);

// GET /api/orders - Get all orders for the logged-in user
router.get('/', orderController.getUserOrders);

module.exports = router;