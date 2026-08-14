const productModel = require('../models/productModel');

// GET /api/products - Get all products (with optional search & category)
async function getAllProducts(req, res) {
  try {
    const { search = '', category = '' } = req.query;
    const products = await productModel.getAllProducts(search, category);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
}

// GET /api/products/categories - Get all categories
async function getCategories(req, res) {
  try {
    const categories = await productModel.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
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

// POST /api/products - Create a new product (admin)
async function createProduct(req, res) {
  try {
    const { name, description, price, image, category, stock } = req.body;

    // Validate required fields
    if (!name || !description || !price || !image || !category || stock === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ success: false, message: 'Invalid price' });
    }

    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      return res.status(400).json({ success: false, message: 'Invalid stock' });
    }

    const productId = await productModel.createProduct({
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      stock: parseInt(stock)
    });

    res.status(201).json({ success: true, message: 'Product created successfully', productId });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
}

// PUT /api/products/:id - Update a product (admin)
async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, image, category, stock } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const existing = await productModel.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await productModel.updateProduct(id, {
      name: name || existing.name,
      description: description || existing.description,
      price: price !== undefined ? parseFloat(price) : existing.price,
      image: image || existing.image,
      category: category || existing.category,
      stock: stock !== undefined ? parseInt(stock) : existing.stock
    });

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
}

// DELETE /api/products/:id - Delete a product (admin)
async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const deleted = await productModel.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};