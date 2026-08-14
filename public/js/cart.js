// =============================================
// CodeAlpha Ecommerce Store - Cart Page
// =============================================

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
          <img src="${item.imageUrl || ''}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
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
        <button class="btn btn-primary" onclick="goToCheckout()">Proceed to Checkout</button>
        <button class="btn btn-outline" onclick="clearCart()">Clear Cart</button>
      </div>
    </div>
  `;
}

// Clear the entire cart
function clearCart() {
  localStorage.removeItem('cart');
  updateCartCount();
  renderCart();
  showToast('Cart cleared.');
}

// Go to checkout
async function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      showToast('Please log in to checkout.', 'error');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    window.location.href = 'checkout.html';
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('An error occurred. Please try again.', 'error');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});