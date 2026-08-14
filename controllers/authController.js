const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

// POST /api/auth/register - Register a new user
async function register(req, res) {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validate all required fields are present
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check that passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if the email is already registered
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const userId = await userModel.createUser(fullName, email, hashedPassword);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
}

// POST /api/auth/login - Log in an existing user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Create a session for the logged-in user
    req.session.userId = user.id;
    req.session.userName = user.full_name;
    req.session.role = user.role;

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

// POST /api/auth/logout - Log out the current user
async function logout(req, res) {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
}

// GET /api/auth/me - Get the currently logged-in user
async function getMe(req, res) {
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await userModel.findUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user information' });
  }
}

// GET /api/auth/profile - Get user profile with order stats
async function getProfile(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const profile = await userModel.getUserProfile(req.session.userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recentOrders = await userModel.getUserRecentOrders(req.session.userId, 5);

    res.json({ success: true, profile, recentOrders });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  getProfile
};