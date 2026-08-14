// =============================================
// CodeAlpha Ecommerce Store - Product Details
// =============================================

// Load a single product's details
async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const container = document.getElementById('productDetail');

  if (!productId) {
    if (container) container.innerHTML = '<p class="no-results">No product ID provided.</p>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/products/${productId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Product not found');
    }

    const product = data.product;
    const inStock = product.stock > 0;
    const imgSrc = product.image || product.image_url || '';
    const safeName = (product.name || '').replace(/'/g, "\\'");

    if (container) {
      container.innerHTML = `
        <div class="product-detail">
          <img src="${imgSrc}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
          <div class="product-detail-info">
            <h1>${product.name}</h1>
            <p class="price">${formatCurrency(product.price)}</p>
            <p class="category">Category: ${product.category || 'Uncategorized'}</p>
            <p class="description">${product.description || ''}</p>
            <p class="stock ${inStock ? 'stock-in' : 'stock-out'}">
              ${inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>
            ${inStock ? `
              <div class="quantity-selector">
                <label for="quantity">Quantity:</label>
                <button class="quantity-btn" onclick="changeQty(-1)">-</button>
                <span id="qtyDisplay">1</span>
                <button class="quantity-btn" onclick="changeQty(1)">+</button>
              </div>
              <button class="btn btn-primary" onclick="addToCart(${product.id}, '${safeName}', ${product.price}, '${imgSrc}', ${product.stock})">
                Add to Cart
              </button>
            ` : '<button class="btn btn-primary" disabled>Out of Stock</button>'}
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading product details:', error);
    if (container) container.innerHTML = '<p class="no-results">Failed to load product details.</p>';
  }
}

// Change quantity selector
function changeQty(delta) {
  const display = document.getElementById('qtyDisplay');
  if (!display) return;
  let qty = parseInt(display.textContent) || 1;
  qty += delta;
  if (qty < 1) qty = 1;
  display.textContent = qty;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();
});