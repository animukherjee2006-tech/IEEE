const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe 
} = require('../controllers/authController');

// Middleware to protect routes (ensure user is logged in)
const protect= require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Consumer or Provider)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token (Stored in HTTP-only cookie)
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear authentication cookie
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user's profile data
 * @access  Private (Needs Token)
 */
// Yahan humne 'protect' middleware use kiya hai taaki sirf logged-in user hi data dekh sake
router.get('/me', protect, getMe);

module.exports = router;