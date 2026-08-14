// =============================================
// CodeAlpha Ecommerce Store - Orders Page
// =============================================

// Load and display user orders
async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const response = await fetch(`${API_URL}/api/orders`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      if (data.message === 'Please log in to view your orders') {
        container.innerHTML = `
          <div class="empty-cart">
            <h2>Please log in to view your orders</h2>
            <p>You need to be logged in to see your order history.</p>
            <a href="login.html" class="btn btn-primary">Login</a>
          </div>
        `;
      } else {
        container.innerHTML = `<p class="no-results">${data.message || 'Failed to load orders'}</p>`;
      }
      return;
    }

    const orders = data.orders;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet. Start shopping!</p>
          <a href="products.html" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map((order) => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <h3>Order #${order.id}</h3>
            <p class="order-date">${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
        </div>
        <div class="order-items">
          ${order.items.map((item) => `
            <div class="order-item">
              <img src="${item.image || ''}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
              <span>${item.name} x ${item.quantity}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <p>Total: <strong>${formatCurrency(order.total_amount)}</strong></p>
          <button class="btn btn-outline" onclick="viewOrder(${order.id})">View Details</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<p class="no-results">Failed to load orders. Please try again.</p>';
  }
}

// View a single order
async function viewOrder(orderId) {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      showToast(data.message || 'Failed to load order', 'error');
      return;
    }

    const order = data.order;
    const container = document.getElementById('ordersContainer');

    container.innerHTML = `
      <div class="order-detail">
        <div class="order-header">
          <div>
            <h2>Order #${order.id}</h2>
            <p class="order-date">${new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
        </div>
        <div class="shipping-info">
          <h3>Shipping Information</h3>
          <p><strong>Name:</strong> ${order.shipping_name}</p>
          <p><strong>Email:</strong> ${order.shipping_email}</p>
          <p><strong>Phone:</strong> ${order.shipping_phone}</p>
          <p><strong>Address:</strong> ${order.shipping_address}, ${order.shipping_city} ${order.postal_code}</p>
        </div>
        <div class="order-items">
          ${order.items.map((item) => `
            <div class="order-item">
              <img src="${item.image || ''}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
              <span>${item.name} x ${item.quantity}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <p>Total: <strong>${formatCurrency(order.total_amount)}</strong></p>
          <button class="btn btn-outline" onclick="loadOrders()">Back to Orders</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error viewing order:', error);
    showToast('Failed to load order details', 'error');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});