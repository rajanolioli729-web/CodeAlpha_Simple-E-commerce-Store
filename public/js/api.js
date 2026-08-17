// =============================================
// CodeAlpha Ecommerce Store - API Configuration
// =============================================
//
// This file controls where the frontend sends API requests.
//
// For LOCAL DEVELOPMENT (backend running on your machine):
//   Leave API_BASE_URL as an empty string '' — same-origin requests
//   are made to the Express server that serves the static files.
//
// For PRODUCTION (GitHub Pages static hosting):
//   Set API_BASE_URL to the URL of your deployed backend, for example:
//   const API_BASE_URL = 'https://your-backend.onrender.com';
//
// IMPORTANT: GitHub Pages is static hosting — it CANNOT run Node/Express.
// You must deploy the backend separately (Render, Railway, Heroku, etc.)
// and set API_BASE_URL to that deployed URL.

const API_BASE_URL = '';

// Helper to build the full API endpoint URL
function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

// Reusable fetch helper that handles JSON parsing and network errors
async function apiFetch(path, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  try {
    const response = await fetch(apiUrl(path), { ...defaults, ...options });
    // Try to parse JSON safely
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { success: false, message: 'Invalid response from server' };
    }
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    console.error(`API request failed: ${path}`, err);
    return { ok: false, status: 0, success: false, message: 'Network error - unable to reach the server. If you are viewing this on GitHub Pages, the backend must be deployed separately.' };
  }
}

// Legacy alias — all existing code uses API_URL
const API_URL = API_BASE_URL;