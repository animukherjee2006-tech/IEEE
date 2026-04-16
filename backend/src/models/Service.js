const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  }, 
  category: { 
    type: String, 
    required: true,
    // Maine tere frontend categories ke hisaab se update kar diya hai
    enum: ['Cleaning', 'Plumbing', 'Electrician', 'Painting', 'Salon', 'Carpentry', 'Technician', 'Haircut'] 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  location: { 
    type: String, 
    required: true 
  }, 
  image: { 
    type: String 
  }, // Cloudinary URL
  
  // Rating logic fields
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: { 
    type: Number, 
    default: 0 
  },
  
  // Optional: Ek field un users ke liye jinhone already rate kiya hai (Duplicate rating rokne ke liye)
  ratedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

}, { timestamps: true });

// Indexing for faster search (Search bar ke liye useful hai)
serviceSchema.index({ title: 'text', category: 'text', location: 'text' });

module.exports = mongoose.model('Service', serviceSchema);