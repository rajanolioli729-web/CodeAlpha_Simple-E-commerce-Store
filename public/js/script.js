// =============================================
// CodeAlpha Ecommerce Store - Main JavaScript
// =============================================

const API_URL = '';

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
  } else {
    if (quantity > maxStock) {
      showToast('Sorry, not enough stock available.', 'error');
      return;
    }
    cart.push({ productId, name, price, imageUrl, quantity });
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
    item.quantity = newQuantity;
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
    const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'same-origin' });
    const data = await response.json();

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
        const response = await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'same-origin'
        });
        const data = await response.json();
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
        <img src="${imgSrc}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
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
    const response = await fetch(`${API_URL}/api/products`);
    const data = await response.json();
    if (data.success) {
      const featured = data.products.slice(0, 4);
      displayProducts(featured, 'featuredProducts');
    }
  } catch (error) {
    console.error('Error loading featured products:', error);
    container.innerHTML = '<p class="no-results">Failed to load products.</p>';
  }
}

async function loadCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  try {
    const response = await fetch(`${API_URL}/api/products/categories`);
    const data = await response.json();
    if (data.success) {
      container.innerHTML = `
        <div class="categories-grid">
          ${data.categories.map((cat) => `
            <div class="category-card" onclick="window.location.href='products.html?category=${encodeURIComponent(cat)}'">
              <h3>${cat}</h3>
            </div>
          `).join('')}
        </div>
      `;
    }
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
