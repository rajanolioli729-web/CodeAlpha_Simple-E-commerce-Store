const productModel = require('../models/productModel');

// GET /api/products - Get all products
async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
}

// GET /api/products/:id - Get a single product by ID
async function getProductById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    // Validate that the ID is a positive number
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
}

module.exports = {
  getAllProducts,
  getProductById
};