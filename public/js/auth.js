// =============================================
// CodeAlpha Ecommerce Store - Auth JavaScript
// =============================================

// Register a new user
async function registerUser(fullName, email, password, confirmPassword) {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });
    return await response.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'same-origin'
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

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
      showToast('Registration successful!');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
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
      showToast('Login successful.');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      showMessage(result.message, 'error');
    }
  });
}

// Initialize auth page
document.addEventListener('DOMContentLoaded', () => {
  setupRegisterForm();
  setupLoginForm();
});