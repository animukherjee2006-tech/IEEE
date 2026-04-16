const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
    },

    role: {
      type: String,
      // 'user' ko yahan wapas add kiya hai taaki purana data crash na kare
      // 'consumer' aur 'provider' naye users ke liye use honge
      enum: {
        values: ['consumer', 'provider', 'admin', 'user'],
        message: '{VALUE} is not a supported role'
      },
      default: 'consumer',
    },

    // Flexible System: Isse pata chalega ki user ne provider profile setup ki hai ya nahi
    isProvider: {
      type: Boolean,
      default: false,
    },

    // User ki profile details (Dono roles ke liye kaam aayengi)
    avatar: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Pre-save hook (Optional): Agar role 'user' aaye toh automatically 'consumer' kar d

module.exports = mongoose.model('User', userSchema);