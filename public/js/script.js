// =============================================
// CodeAlpha Ecommerce Store - Main JavaScript
// =============================================

// ---------- API Base URL ----------
const API_URL = '';

// ---------- Utility Functions ----------

// Helper to display a message to the user
function showMessage(message, type = 'error') {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';
  }
}

// Format a number as currency
function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

// Get the cart from localStorage
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

// Save the cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Update the cart count badge in the navigation
function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// ---------- Navigation & Auth State ----------

// Toggle mobile navigation menu
function setupMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// Check if the user is logged in and update the navigation
async function checkAuthState() {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'same-origin'
    });
    const data = await response.json();

    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (data.success && authLinks && userMenu) {
      authLinks.style.display = 'none';
      userMenu.style.display = 'flex';
      if (userName) {
        userName.textContent = `Hi, ${data.user.full_name.split(' ')[0]}`;
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Set up the logout button
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await logoutUser();
    });
  }
}

// ---------- Product Functions ----------

// Load all products from the API
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to load products');
    }

    return data.products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Display products in the grid
function displayProducts(products, containerId = 'productsGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }

  container.innerHTML = products.map((product) => `
    <div class="product-card">
      <img src="${product.image_url}" alt="${product.name}">
      <div class="product-card-body">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <div class="product-actions">
          <button class="btn btn-outline" onclick="window.location.href='product.html?id=${product.id}'">View Details</button>
          <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image_url}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Load and display featured products on the home page
async function loadFeaturedProducts() {
  const products = await loadProducts();
  // Show only the first 4 products as featured
  const featured = products.slice(0, 4);
  displayProducts(featured, 'featuredProducts');
}

// Load and display all products on the products page
async function loadAllProducts() {
  const products = await loadProducts();
  displayProducts(products, 'productsGrid');
  return products;
}

// Load a single product's details
async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    const container = document.getElementById('productDetail');
    if (container) {
      container.innerHTML = '<p class="no-results">No product ID provided.</p>';
    }
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/products/${productId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Product not found');
    }

    const product = data.product;
    const container = document.getElementById('productDetail');

    if (container) {
      const inStock = product.quantity > 0;
      container.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <div class="product-detail-info">
          <h1>${product.name}</h1>
          <p class="price">${formatCurrency(product.price)}</p>
          <p class="description">${product.description}</p>
          <p class="stock ${inStock ? 'stock-in' : 'stock-out'}">
            ${inStock ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
          </p>
          <button class="btn btn-primary" ${inStock ? '' : 'disabled'} onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image_url}')">
            Add to Cart
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading product details:', error);
    const container = document.getElementById('productDetail');
    if (container) {
      container.innerHTML = '<p class="no-results">Failed to load product details.</p>';
    }
  }
}

// ---------- Cart Functions ----------

// Add a product to the cart
function addToCart(productId, name, price, imageUrl) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId,
      name,
      price,
      imageUrl,
      quantity: 1
    });
  }

  saveCart(cart);
  alert(`${name} added to cart!`);
}

// Remove a product from the cart
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.productId !== productId);
  saveCart(cart);
  renderCart();
}

// Update the quantity of a product in the cart
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

// Calculate the subtotal of the cart
function calculateTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Render the cart page
function renderCart() {
  const container = document.getElementById('cartContainer');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Browse our products and add some items to your cart!</p>
        <a href="products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  const total = calculateTotal();

  container.innerHTML = `
    <div class="cart-container">
      ${cart.map((item) => `
        <div class="cart-item">
          <img src="${item.imageUrl}" alt="${item.name}">
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p class="price">${formatCurrency(item.price)}</p>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateCart(${item.productId}, ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="updateCart(${item.productId}, ${item.quantity + 1})">+</button>
          </div>
          <p class="cart-item-total">${formatCurrency(item.price * item.quantity)}</p>
          <button class="btn btn-danger" onclick="removeFromCart(${item.productId})">Remove</button>
        </div>
      `).join('')}

      <div class="cart-summary">
        <p class="subtotal">Subtotal: <strong>${formatCurrency(total)}</strong></p>
        <p class="total">Total: ${formatCurrency(total)}</p>
        <button class="btn btn-primary" onclick="checkout()">Proceed to Checkout</button>
      </div>
    </div>
  `;
}

// Handle the checkout process
async function checkout() {
  const cart = getCart();

  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  try {
    // Check if the user is logged in
    const meResponse = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'same-origin'
    });
    const meData = await meResponse.json();

    if (!meData.success) {
      alert('Please log in to place an order.');
      window.location.href = 'login.html';
      return;
    }

    await placeOrder();
  } catch (error) {
    console.error('Checkout error:', error);
    alert('An error occurred during checkout. Please try again.');
  }
}

// Place an order
async function placeOrder() {
  const cart = getCart();

  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const items = cart.map((item) => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items }),
      credentials: 'same-origin'
    });

    const data = await response.json();

    if (data.success) {
      // Clear the cart after a successful order
      localStorage.removeItem('cart');
      updateCartCount();
      alert(`Order placed successfully! Order ID: ${data.order.id}`);
      window.location.href = 'products.html';
    } else {
      alert(data.message || 'Failed to place order');
    }
  } catch (error) {
    console.error('Order error:', error);
    alert('Failed to place order. Please try again.');
  }
}

// ---------- Authentication Functions ----------

// Register a new user
async function registerUser(fullName, email, password, confirmPassword) {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}

// Log in a user
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'same-origin'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

// Log out the current user
async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'same-origin'
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
}

// ---------- Event Listeners ----------

// Set up the registration form
function setupRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Client-side validation
    if (!fullName || !email || !password || !confirmPassword) {
      showMessage('All fields are required', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    const result = await registerUser(fullName, email, password, confirmPassword);

    if (result.success) {
      showMessage(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      showMessage(result.message, 'error');
    }
  });
}

// Set up the login form
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    const result = await loginUser(email, password);

    if (result.success) {
      showMessage(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showMessage(result.message, 'error');
    }
  });
}

// Set up the search functionality on the products page
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  if (!searchInput || !searchBtn) return;

  const performSearch = async () => {
    const query = searchInput.value.toLowerCase();
    const products = await loadProducts();

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

    const noResults = document.getElementById('noResults');
    if (noResults) {
      noResults.style.display = filtered.length === 0 ? 'block' : 'none';
    }

    displayProducts(filtered, 'productsGrid');
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// ---------- Initialize on Page Load ----------
document.addEventListener('DOMContentLoaded', () => {
  // Get the current page filename
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);

  // Setup common elements
  setupMobileNav();
  setupLogout();
  updateCartCount();
  checkAuthState();

  // Page-specific initialization
  if (page === '' || page === 'index.html') {
    loadFeaturedProducts();
  } else if (page === 'products.html') {
    loadAllProducts();
    setupSearch();
  } else if (page === 'product.html') {
    loadProductDetails();
  } else if (page === 'cart.html') {
    renderCart();
  } else if (page === 'register.html') {
    setupRegisterForm();
  } else if (page === 'login.html') {
    setupLoginForm();
  }
});