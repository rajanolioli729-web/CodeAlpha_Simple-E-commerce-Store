// =============================================
// CodeAlpha Ecommerce Store - Checkout Page
// =============================================

// Render the checkout page
async function renderCheckout() {
  const container = document.getElementById('checkoutContainer');
  if (!container) return;

  // Check if user is logged in
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      container.innerHTML = `
        <div class="empty-cart">
          <h2>Please log in to checkout</h2>
          <p>You need to be logged in to place an order.</p>
          <a href="login.html" class="btn btn-primary">Login</a>
        </div>
      `;
      return;
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart before checking out.</p>
        <a href="products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  const total = calculateTotal();

  container.innerHTML = `
    <div class="checkout-container">
      <div class="checkout-form-section">
        <h2>Shipping Information</h2>
        <form id="checkoutForm" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder="Enter your full name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" required>
          </div>
          <div class="form-group">
            <label for="address">Shipping Address</label>
            <textarea id="address" name="address" placeholder="Enter your full address" required></textarea>
          </div>
          <div class="form-group">
            <label for="city">City</label>
            <input type="text" id="city" name="city" placeholder="Enter your city" required>
          </div>
          <div class="form-group">
            <label for="postalCode">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" placeholder="Enter postal code" required>
          </div>
          <div id="message" class="form-message"></div>
          <button type="submit" class="btn btn-primary btn-block">Place Order</button>
        </form>
      </div>

      <div class="checkout-summary-section">
        <h2>Order Summary</h2>
        <div class="checkout-items">
          ${cart.map((item) => `
            <div class="checkout-item">
              <span>${item.name} x ${item.quantity}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="checkout-total">
          <p>Total: <strong>${formatCurrency(total)}</strong></p>
        </div>
        <div class="payment-method">
          <h3>Payment Method</h3>
          <p><strong>Cash on Delivery</strong></p>
          <p class="demo-note">This is a demo/internship project. No real payment is processed.</p>
        </div>
      </div>
    </div>
  `;

  setupCheckoutForm();
}

// Set up the checkout form submission
function setupCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const shipping = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      postalCode: document.getElementById('postalCode').value.trim()
    };

    // Validate all fields
    for (const key in shipping) {
      if (!shipping[key]) {
        showMessage('Please fill in all fields', 'error');
        return;
      }
    }

    const cart = getCart();
    const items = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order...';

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping }),
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (data.success) {
        // Clear the cart after successful order
        localStorage.removeItem('cart');
        updateCartCount();
        showToast('Your order has been placed successfully.');
        window.location.href = `order-success.html?orderId=${data.order.id}`;
      } else {
        showMessage(data.message || 'Failed to place order', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
      }
    } catch (error) {
      console.error('Order error:', error);
      showMessage('Failed to place order. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();
});