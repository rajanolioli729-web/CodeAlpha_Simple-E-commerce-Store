const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdmin } = require('../middleware/adminMiddleware');

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/categories - Get all categories
router.get('/categories', productController.getCategories);

// GET /api/products/:id - Get a single product by ID
router.get('/:id', productController.getProductById);

// Admin routes (protected)
// POST /api/products - Create a new product (admin)
router.post('/', requireAdmin, productController.createProduct);

// PUT /api/products/:id - Update a product (admin)
router.put('/:id', requireAdmin, productController.updateProduct);

// DELETE /api/products/:id - Delete a product (admin)
router.delete('/:id', requireAdmin, productController.deleteProduct);

module.exports = router;