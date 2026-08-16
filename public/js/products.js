// =============================================
// CodeAlpha Ecommerce Store - Products Page
// =============================================

let allProducts = [];
let currentCategory = '';

// Try the API first; fall back to the static catalog (GitHub Pages has no backend)
async function fetchProductsFromApi() {
  const response = await fetch(`${API_URL}/api/products`);
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Failed to load products');
  return data.products;
}

// Load all products from the API
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (grid) grid.innerHTML = '<div class="loading">Loading...</div>';

  try {
    let products;
    try {
      products = await fetchProductsFromApi();
    } catch (apiError) {
      console.warn('API unavailable, using static product catalog:', apiError);
      products = window.STATIC_PRODUCTS || [];
    }

    allProducts = products;
    // Apply category filter if one was passed via URL
    if (currentCategory) {
      applyFilters();
    } else {
      displayProducts(allProducts);
    }
    loadCategories();
  } catch (error) {
    console.error('Error loading products:', error);
    if (grid) grid.innerHTML = '<p class="no-results">Failed to load products. Please try again.</p>';
  }
}

// Load categories for filtering
async function loadCategories() {
  try {
    let categories;
    try {
      const response = await fetch(`${API_URL}/api/products/categories`);
      const data = await response.json();
      if (data.success) {
        categories = data.categories;
      } else {
        throw new Error(data.message || 'Failed to load categories');
      }
    } catch (apiError) {
      console.warn('API categories unavailable, deriving from static catalog:', apiError);
      const seen = new Set();
      categories = [];
      (window.STATIC_PRODUCTS || []).forEach((p) => {
        if (p.category && !seen.has(p.category)) {
          seen.add(p.category);
          categories.push(p.category);
        }
      });
    }

    const filter = document.getElementById('categoryFilter');
    if (filter) {
      const buttons = categories.map((cat) =>
        `<button class="category-btn" data-category="${cat}">${cat}</button>`
      ).join('');
      filter.innerHTML = `<button class="category-btn" data-category="">All</button>${buttons}`;
      setupCategoryListeners();

      if (currentCategory) {
        document.querySelectorAll('.category-btn').forEach((b) => {
          if (b.dataset.category === currentCategory) {
            b.classList.add('active');
          }
        });
      } else {
        const first = document.querySelector('.category-btn[data-category=""]');
        if (first) first.classList.add('active');
      }
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Set up category filter listeners
function setupCategoryListeners() {
  document.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });
}

// Apply search and category filters
function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value.toLowerCase() : '';

  let filtered = allProducts;
  if (currentCategory) {
    filtered = filtered.filter((p) => p.category === currentCategory);
  }
  if (query) {
    filtered = filtered.filter((p) =>
      (p.name || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query)
    );
  }

  const noResults = document.getElementById('noResults');
  if (noResults) noResults.style.display = filtered.length === 0 ? 'block' : 'none';

  displayProducts(filtered);
}

// Set up search
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') applyFilters();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check for category from URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    currentCategory = categoryParam;
  }
  loadProducts();
  setupSearch();
});