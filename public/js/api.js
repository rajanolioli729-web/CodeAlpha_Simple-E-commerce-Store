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

// Attach everything to window so it survives cache/superseded script ordering.
(function (global) {
  const API_BASE_URL = '';

  // Helper to build the full API endpoint URL
  function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
  }

  // Detect if a response body looks like HTML (e.g., a 404 page from GitHub Pages or a web server)
  function looksLikeHtml(text) {
    if (!text) return false;
    const trimmed = text.trim();
    return (
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('<head') ||
      trimmed.startsWith('<body') ||
      /<[a-z][a-z0-9]*[\s>]/i.test(trimmed) // any tag-like content
    );
  }

  // Reusable fetch helper that handles JSON parsing and network errors
  async function apiFetch(path, options = {}) {
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };
    try {
      const response = await fetch(apiUrl(path), { ...defaults, ...options });
      // Try to parse JSON safely (GitHub Pages 404 returns HTML, not JSON)
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        // The response wasn't JSON. This typically means:
        //   - The page is being served from GitHub Pages/static hosting
        //     and no backend is deployed (API route returns an HTML 404).
        //   - The Express server isn't running at the expected URL.
        if (looksLikeHtml(text)) {
          data = {
            success: false,
            message:
              'The backend server is not reachable from this page. ' +
              'If you are viewing this on GitHub Pages, you must deploy the Node.js/Express ' +
              'backend separately and set API_BASE_URL in public/js/api.js. ' +
              'For local development, open http://localhost:3000/register.html instead.'
          };
        } else {
          data = { success: false, message: 'Invalid response from server' };
        }
      }
      return { ok: response.ok, status: response.status, ...data };
    } catch (err) {
      console.error(`API request failed: ${path}`, err);
      return {
        ok: false,
        status: 0,
        success: false,
        message: 'Network error - unable to reach the server. If you are viewing this on GitHub Pages, the backend must be deployed separately.'
      };
    }
  }

  // Expose on the global scope (and legacy globals used by the rest of the code)
  global.API_BASE_URL = API_BASE_URL;
  global.API_URL = API_BASE_URL;
  global.apiUrl = apiUrl;
  global.apiFetch = apiFetch;
})(window);