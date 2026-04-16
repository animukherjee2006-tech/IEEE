const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= TOKEN GENERATOR =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Naya User create karte waqt role filter
    // Agar role 'provider' hai toh isProvider flag ko true kar denge
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'consumer',
      isProvider: role === 'provider' ? true : false,
    });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProvider: user.isProvider
      },
    });

  } catch (err) {
    console.log("Register Error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

    // User ko dhoondo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Password verify karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // --- LOGIC FOR FLEXIBLE ROLE ---
    // Agar purana data 'user' hai, toh use 'consumer' ki tarah login karwao
    const finalRole = user.role === 'user' ? 'consumer' : user.role;

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: finalRole, // Updated Role
        isProvider: user.isProvider, // Helps in frontend navigation
      },
    });

  } catch (err) {
    console.log("Login Error:", err.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  res.cookie('token', '', { 
    httpOnly: true, 
    expires: new Date(0) 
  });
  return res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};

// ================= GET ME (PROFILE) =================
exports.getMe = async (req, res) => {
  try {
    // req.user protect middleware se aata hai
    if (!req.user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Yahan bhi role fix apply kar sakte ho agar zarurat ho
    const userData = req.user.toObject();
    if(userData.role === 'user') userData.role = 'consumer';

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};