const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  consumer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  serviceType: { 
    type: String, 
    required: true 
  }, // Haircut, Plumbing, etc.
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    // Yahan maine saare relevant status add kar diye hain
    enum: ['pending', 'accepted', 'confirmed', 'rejected', 'declined', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  providerNote: { 
    type: String, 
    default: "" // Provider ya Consumer ka feedback/message save karne ke liye
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);