const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const protect = require('../middleware/authMiddleware');

// 1. Get Chat History (Purani chat load karne ke liye)
// GET /api/messages/:bookingId
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ bookingId: req.params.bookingId })
      .sort({ createdAt: 1 }); // Purane messages pehle, naye niche
    
    res.status(200).json({ 
      success: true, 
      messages 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// 2. Send New Message (Naya message database mein save karne ke liye)
// POST /api/messages/
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, sender, receiver, text } = req.body;

    // Validation: Check if all fields are present
    if (!bookingId || !sender || !receiver || !text) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields (bookingId, sender, receiver, text) are required" 
      });
    }

    const newMessage = await Message.create({
      bookingId,
      sender,
      receiver,
      text
    });

    // Socket Emit logic agar tu controller se handle karna chahe toh yahan aa sakta hai
    // Filhal hum frontend se emit kar rahe hain toh zaroorat nahi hai

    res.status(201).json({ 
      success: true, 
      message: newMessage 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

module.exports = router;