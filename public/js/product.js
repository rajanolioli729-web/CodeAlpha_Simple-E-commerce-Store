// =============================================
// CodeAlpha Ecommerce Store - Product Details
// =============================================

function renderProductDetail(product, container) {
  const inStock = product.stock > 0;
  const imgSrc = product.image || product.image_url || '';
  const safeName = (product.name || '').replace(/'/g, "\\'");
  // Expose the stock so changeQty() can cap the quantity selector
  window.currentProductStock = product.stock;

  container.innerHTML = `
    <div class="product-detail">
      <img src="${imgSrc}" alt="${product.name}" onerror="this.src=FALLBACK_IMAGE">
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
          <button class="btn btn-primary" onclick="addToCart(${product.id}, '${safeName}', ${product.price}, '${imgSrc}', ${product.stock}, getSelectedQty())">
            Add to Cart
          </button>
        ` : '<button class="btn btn-primary" disabled>Out of Stock</button>'}
      </div>
    </div>
  `;
}

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
    let product = null;

    // 1. Try the live API (backend available)
    try {
      const data = await apiFetch(`/api/products/${productId}`);
      if (data.success && data.product) {
        product = data.product;
      } else {
        throw new Error(data.message || 'Product not found');
      }
    } catch (apiError) {
      console.warn('API unavailable, using static product catalog:', apiError);
      // 2. Fall back to the static catalog (GitHub Pages has no backend)
      const staticProduct = (window.STATIC_PRODUCTS || []).find(
        (p) => String(p.id) === String(productId)
      );
      if (staticProduct) {
        product = staticProduct;
      } else {
        throw new Error('Product not found');
      }
    }

    if (container && product) {
      renderProductDetail(product, container);
    }
  } catch (error) {
    console.error('Error loading product details:', error);
    if (container) container.innerHTML = '<p class="no-results">Failed to load product details.</p>';
  }
}

// Change quantity selector (capped at available stock)
function changeQty(delta) {
  const display = document.getElementById('qtyDisplay');
  if (!display) return;
  const maxQty = window.currentProductStock || 999;
  let qty = parseInt(display.textContent) || 1;
  qty += delta;
  if (qty < 1) qty = 1;
  if (qty > maxQty) {
    qty = maxQty;
    showToast(`Only ${maxQty} available in stock.`, 'error');
  }
  display.textContent = qty;
}

// Get the currently selected quantity
function getSelectedQty() {
  const display = document.getElementById('qtyDisplay');
  const qty = display ? parseInt(display.textContent) : 1;
  return qty > 0 ? qty : 1;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();
});