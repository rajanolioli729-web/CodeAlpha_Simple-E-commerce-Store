// =============================================
// CodeAlpha Ecommerce Store - Main JavaScript
// =============================================

// ----- Defensive API fallback -----
// api.js is supposed to define window.API_URL and window.apiFetch.
// If it hasn't loaded (old browser cache, CDN hiccup, etc.), provide
// inline defaults so the rest of the code never throws ReferenceError.
(function () {
  if (typeof window.apiFetch !== 'function') {
    window.API_BASE_URL = '';
    window.API_URL = '';
    window.apiUrl = function (path) { return window.API_BASE_URL + path; };
    window.apiFetch = async function (path, options) {
      try {
        const response = await fetch(window.apiUrl(path), { credentials: 'include', ...options });
        const text = await response.text();
        let data;
        try { data = JSON.parse(text); }
        catch (e) { data = { success: false, message: 'Invalid response' }; }
        return { ok: response.ok, status: response.status, ...data };
      } catch (err) {
        return { ok: false, status: 0, success: false, message: 'Network error' };
      }
    };
  }
})();

// Local fallback image (data URI) used when a product image fails to load.
// This avoids external CDN requests (per project constraint: no external images).
const FALLBACK_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
  '<rect width="400" height="300" fill="#e5e7eb"/>' +
  '<text x="200" y="150" font-family="Arial" font-size="20" fill="#6b7280" text-anchor="middle">No Image</text>' +
  '</svg>'
);

// ---------- Toast Notification System ----------
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// ---------- Utility Functions ----------
function showMessage(message, type = 'error') {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';
  }
}

function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

// ---------- Cart Functions ----------
function getCart() {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

function addToCart(productId, name, price, imageUrl, maxStock = 999, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > maxStock) {
      showToast('Sorry, not enough stock available.', 'error');
      return;
    }
    existingItem.quantity = newQty;
    existingItem.maxStock = maxStock;
  } else {
    if (quantity > maxStock) {
      showToast('Sorry, not enough stock available.', 'error');
      return;
    }
    cart.push({ productId, name, price, imageUrl, quantity, maxStock });
  }

  saveCart(cart);
  showToast('Product added to cart.');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.productId !== productId);
  saveCart(cart);
  renderCart();
}

function updateCart(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find((item) => item.productId === productId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    // Respect stock limits if we know them
    const maxStock = item.maxStock || item.stock;
    if (maxStock && newQuantity > maxStock) {
      item.quantity = maxStock;
      showToast(`Only ${maxStock} available in stock.`, 'error');
    } else {
      item.quantity = newQuantity;
    }
    saveCart(cart);
    renderCart();
  }
}

function calculateTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + parseFloat(item.price || 0) * item.quantity, 0);
}

// ---------- Navigation & Auth State ----------
function setupMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

async function checkAuthState() {
  try {
    const data = await apiFetch('/api/auth/me');

    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (data.success && authLinks && userMenu) {
      authLinks.style.display = 'none';
      userMenu.style.display = 'flex';
      if (userName) {
        const name = data.user.full_name || data.user.fullName || 'User';
        userName.textContent = `Hi, ${name.split(' ')[0]}`;
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const data = await apiFetch('/api/auth/logout', { method: 'POST' });
        if (data.success) {
          showToast('Logged out successfully.');
          setTimeout(() => { window.location.href = 'index.html'; }, 500);
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }
}

// ---------- Product Display ----------
function displayProducts(products, containerId = 'productsGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Ensure the container has the grid class for proper product-card layout
  if (!container.classList.contains('products-grid')) {
    container.classList.add('products-grid');
  }

  if (!products || products.length === 0) {
    container.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }

  container.innerHTML = products.map((product) => {
    const inStock = product.stock > 0;
    const imgSrc = product.image || product.image_url || '';
    const safeName = (product.name || '').replace(/'/g, "\\'");
    return `
      <div class="product-card">
        <img src="${imgSrc}" alt="${product.name}" onerror="this.src=FALLBACK_IMAGE">
        <div class="product-card-body">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description || ''}</p>
          <p class="product-price">${formatCurrency(product.price)}</p>
          <p class="product-stock ${inStock ? 'stock-in' : 'stock-out'}">${inStock ? `In Stock (${product.stock})` : 'Out of Stock'}</p>
          <div class="product-actions">
            <button class="btn btn-outline" onclick="window.location.href='product.html?id=${product.id}'">View</button>
            <button class="btn btn-primary" ${inStock ? `onclick="addToCart(${product.id}, '${safeName}', ${product.price}, '${imgSrc}', ${product.stock})"` : 'disabled'}>${inStock ? 'Add to Cart' : 'Out of Stock'}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- Home Page Functions ----------
async function loadFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  try {
    let products = null;

    // 1. Try the live API (backend available)
    try {
      const data = await apiFetch('/api/products');
      if (data.success) {
        products = data.products;
      } else {
        throw new Error(data.message || 'Failed to load products');
      }
    } catch (apiError) {
      console.warn('API unavailable, using static product catalog:', apiError);
      // 2. Fall back to the static catalog (GitHub Pages has no backend)
      products = window.STATIC_PRODUCTS || [];
    }

    const featured = products.slice(0, 4);
    displayProducts(featured, 'featuredProducts');
  } catch (error) {
    console.error('Error loading featured products:', error);
    container.innerHTML = '<p class="no-results">Failed to load products.</p>';
  }
}

async function loadCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  try {
    let categories = null;

    // 1. Try the live API (backend available)
    try {
      const data = await apiFetch('/api/products/categories');
      if (data.success) {
        categories = data.categories;
      } else {
        throw new Error(data.message || 'Failed to load categories');
      }
    } catch (apiError) {
      console.warn('API categories unavailable, deriving from static catalog:', apiError);
      // 2. Fall back to the static catalog (GitHub Pages has no backend)
      const seen = new Set();
      categories = [];
      (window.STATIC_PRODUCTS || []).forEach((p) => {
        if (p.category && !seen.has(p.category)) {
          seen.add(p.category);
          categories.push(p.category);
        }
      });
    }

    container.innerHTML = `
      <div class="categories-grid">
        ${categories.map((cat) => `
          <div class="category-card" onclick="window.location.href='products.html?category=${encodeURIComponent(cat)}'">
            <h3>${cat}</h3>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error loading categories:', error);
    container.innerHTML = '<p class="no-results">Failed to load categories.</p>';
  }
}

// ---------- Initialize on Page Load ----------
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupLogout();
  updateCartCount();
  checkAuthState();

  // Home page specific
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  if (page === '' || page === 'index.html') {
    loadFeaturedProducts();
    loadCategories();
  }
});