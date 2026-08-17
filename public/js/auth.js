// =============================================
// CodeAlpha Ecommerce Store - Auth JavaScript
// =============================================

// Register a new user
async function registerUser(fullName, email, password, confirmPassword) {
  try {
    return await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}

// Log in a user
async function loginUser(email, password) {
  try {
    return await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
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

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.disabled) return; // prevent double submission

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

    // Disable the button to prevent duplicate submissions
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';
    }

    const result = await registerUser(fullName, email, password, confirmPassword);

    if (result.success) {
      showMessage(result.message, 'success');
      showToast('Registration successful!');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } else {
      showMessage(result.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    }
  });
}

// Set up the login form
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.disabled) return; // prevent double submission

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    // Disable the button during the request
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
    }

    const result = await loginUser(email, password);

    if (result.success) {
      showMessage(result.message, 'success');
      showToast('Login successful.');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      showMessage(result.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    }
  });
}

// Initialize auth page
document.addEventListener('DOMContentLoaded', () => {
  setupRegisterForm();
  setupLoginForm();
});