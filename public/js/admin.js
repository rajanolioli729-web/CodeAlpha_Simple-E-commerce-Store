// =============================================
// CodeAlpha Ecommerce Store - Admin JavaScript
// =============================================

// Check if user is admin
async function checkAdmin() {
  try {
    const data = await apiFetch('/api/auth/me');
    if (!data.success || data.user.role !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => { window.location.href = '../index.html'; }, 1000);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// Load admin dashboard
async function loadDashboard() {
  const container = document.getElementById('adminDashboard');
  if (!container) return;

  try {
    const [ordersData, productsData] = await Promise.all([
      apiFetch('/api/admin/orders'),
      apiFetch('/api/products')
    ]);

    const orders = ordersData.success ? ordersData.orders : [];
    const products = productsData.success ? productsData.products : [];

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    container.innerHTML = `
      <div class="admin-stats">
        <div class="stat-card">
          <h3>Total Products</h3>
          <p>${products.length}</p>
        </div>
        <div class="stat-card">
          <h3>Total Orders</h3>
          <p>${orders.length}</p>
        </div>
        <div class="stat-card">
          <h3>Pending Orders</h3>
          <p>${pendingOrders}</p>
        </div>
        <div class="stat-card">
          <h3>Total Revenue</h3>
          <p>${formatCurrency(totalRevenue)}</p>
        </div>
      </div>
      <div class="admin-actions">
        <a href="products.html" class="btn btn-primary">Manage Products</a>
        <a href="orders.html" class="btn btn-outline">Manage Orders</a>
      </div>
    `;
  } catch (error) {
    console.error('Dashboard error:', error);
    container.innerHTML = '<p class="no-results">Failed to load dashboard.</p>';
  }
}

// Load admin products
async function loadAdminProducts() {
  const container = document.getElementById('adminProductsContainer');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = await apiFetch('/api/products');

    if (!data.success) {
      container.innerHTML = '<p class="no-results">Failed to load products.</p>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.products.map((p) => `
            <tr>
              <td>${p.id}</td>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${formatCurrency(p.price)}</td>
              <td>${p.stock}</td>
              <td>
                <button class="btn btn-outline" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Admin products error:', error);
    container.innerHTML = '<p class="no-results">Failed to load products.</p>';
  }
}

// Show add product form
function showAddProductForm() {
  const container = document.getElementById('productFormContainer');
  if (!container) return;

  container.style.display = 'block';
  container.innerHTML = `
    <div class="admin-form">
      <h3>Add New Product</h3>
      <form id="productForm">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="pName" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="pDescription" required></textarea>
        </div>
        <div class="form-group">
          <label>Price</label>
          <input type="number" id="pPrice" step="0.01" min="0" required>
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <input type="text" id="pImage" required>
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" id="pCategory" required>
        </div>
        <div class="form-group">
          <label>Stock</label>
          <input type="number" id="pStock" min="0" required>
        </div>
        <button type="submit" class="btn btn-primary">Save Product</button>
        <button type="button" class="btn btn-outline" onclick="hideProductForm()">Cancel</button>
      </form>
    </div>
  `;

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await createProduct();
  });
}

// Hide product form
function hideProductForm() {
  const container = document.getElementById('productFormContainer');
  if (container) container.style.display = 'none';
}

// Create a new product
async function createProduct() {
  const product = {
    name: document.getElementById('pName').value.trim(),
    description: document.getElementById('pDescription').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    image: document.getElementById('pImage').value.trim(),
    category: document.getElementById('pCategory').value.trim(),
    stock: parseInt(document.getElementById('pStock').value)
  };

  try {
    const data = await apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });

    if (data.success) {
      showToast('Product created successfully.');
      hideProductForm();
      loadAdminProducts();
    } else {
      showToast(data.message || 'Failed to create product', 'error');
    }
  } catch (error) {
    console.error('Create product error:', error);
    showToast('Failed to create product', 'error');
  }
}

// Edit a product
async function editProduct(id) {
  try {
    const data = await apiFetch(`/api/products/${id}`);
    if (!data.success) {
      showToast('Product not found', 'error');
      return;
    }

    const p = data.product;
    const container = document.getElementById('productFormContainer');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
      <div class="admin-form">
        <h3>Edit Product #${p.id}</h3>
        <form id="productForm">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="pName" value="${p.name}" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="pDescription" required>${p.description}</textarea>
          </div>
          <div class="form-group">
            <label>Price</label>
            <input type="number" id="pPrice" step="0.01" min="0" value="${p.price}" required>
          </div>
          <div class="form-group">
            <label>Image URL</label>
            <input type="text" id="pImage" value="${p.image}" required>
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" id="pCategory" value="${p.category}" required>
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input type="number" id="pStock" min="0" value="${p.stock}" required>
          </div>
          <button type="submit" class="btn btn-primary">Update Product</button>
          <button type="button" class="btn btn-outline" onclick="hideProductForm()">Cancel</button>
        </form>
      </div>
    `;

    document.getElementById('productForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateProduct(id);
    });
  } catch (error) {
    console.error('Edit product error:', error);
    showToast('Failed to load product', 'error');
  }
}

// Update a product
async function updateProduct(id) {
  const product = {
    name: document.getElementById('pName').value.trim(),
    description: document.getElementById('pDescription').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    image: document.getElementById('pImage').value.trim(),
    category: document.getElementById('pCategory').value.trim(),
    stock: parseInt(document.getElementById('pStock').value)
  };

  try {
    const data = await apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });

    if (data.success) {
      showToast('Product updated successfully.');
      hideProductForm();
      loadAdminProducts();
    } else {
      showToast(data.message || 'Failed to update product', 'error');
    }
  } catch (error) {
    console.error('Update product error:', error);
    showToast('Failed to update product', 'error');
  }
}

// Delete a product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const data = await apiFetch(`/api/products/${id}`, {
      method: 'DELETE'
    });

    if (data.success) {
      showToast('Product deleted successfully.');
      loadAdminProducts();
    } else {
      showToast(data.message || 'Failed to delete product', 'error');
    }
  } catch (error) {
    console.error('Delete product error:', error);
    showToast('Failed to delete product', 'error');
  }
}

// Load admin orders
async function loadAdminOrders() {
  const container = document.getElementById('adminOrdersContainer');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = await apiFetch('/api/admin/orders');

    if (!data.success) {
      container.innerHTML = '<p class="no-results">Failed to load orders.</p>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.orders.map((o) => `
            <tr>
              <td>#${o.id}</td>
              <td>${o.full_name}<br><small>${o.email}</small></td>
              <td>${formatCurrency(o.total_amount)}</td>
              <td>
                <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">
                  ${['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s =>
                    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
                  ).join('')}
                </select>
              </td>
              <td>${new Date(o.created_at).toLocaleDateString()}</td>
              <td><button class="btn btn-outline" onclick="viewAdminOrder(${o.id})">View</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Admin orders error:', error);
    container.innerHTML = '<p class="no-results">Failed to load orders.</p>';
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const data = await apiFetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    if (data.success) {
      showToast('Order status updated.');
    } else {
      showToast(data.message || 'Failed to update status', 'error');
    }
  } catch (error) {
    console.error('Update status error:', error);
    showToast('Failed to update status', 'error');
  }
}

// View admin order details
async function viewAdminOrder(orderId) {
  try {
    const data = await apiFetch(`/api/admin/orders/${orderId}`);

    if (!data.success) {
      showToast('Failed to load order', 'error');
      return;
    }

    const order = data.order;
    const container = document.getElementById('adminOrdersContainer');

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
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${order.shipping_name}</p>
          <p><strong>Email:</strong> ${order.shipping_email}</p>
          <p><strong>Phone:</strong> ${order.shipping_phone}</p>
          <p><strong>Address:</strong> ${order.shipping_address}, ${order.shipping_city} ${order.postal_code}</p>
        </div>
        <div class="order-items">
          ${order.items.map((item) => `
            <div class="order-item">
              <img src="${item.image || ''}" alt="${item.name}" onerror="this.src=FALLBACK_IMAGE">
              <span>${item.name} x ${item.quantity}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <p>Total: <strong>${formatCurrency(order.total_amount)}</strong></p>
          <button class="btn btn-outline" onclick="loadAdminOrders()">Back to Orders</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('View admin order error:', error);
    showToast('Failed to load order details', 'error');
  }
}

// Initialize admin pages
document.addEventListener('DOMContentLoaded', async () => {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return;

  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);

  if (page === 'index.html') {
    loadDashboard();
  } else if (page === 'products.html') {
    loadAdminProducts();
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) addBtn.addEventListener('click', showAddProductForm);
  } else if (page === 'orders.html') {
    loadAdminOrders();
  }
});