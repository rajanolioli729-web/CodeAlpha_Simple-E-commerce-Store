const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Log in an existing user
router.post('/login', authController.login);

// POST /api/auth/logout - Log out the current user
router.post('/logout', authController.logout);

// GET /api/auth/me - Get the currently logged-in user
router.get('/me', authController.getMe);

// GET /api/auth/profile - Get user profile with order stats
router.get('/profile', authController.getProfile);

module.exports = router;