const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const Message = require('./src/models/Message');

// Env and DB
dotenv.config();
connectDB();

const app = express();

// --- Socket.io Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  }
});

// --- Socket Connection Logic ---
io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  // User joins a room based on bookingId for specific job chat
  socket.on('join_room', (bookingId) => {
    socket.join(bookingId);
    console.log(`👤 User joined booking chat room: ${bookingId}`);
  });

  // REAL-TIME PRIVATE CHAT
  socket.on('send_message', async (data) => {
    try {
      const { bookingId, senderId, receiverId, text } = data;

      // 1. Database mein save karo (Context storage)
      const newMessage = await Message.create({
        bookingId,
        sender: senderId,
        receiver: receiverId,
        text
      });

      // 2. Room (bookingId) ke saare members ko message bhejdo
      // Isse sender aur receiver dono ke screen pe real-time update hoga
      io.to(bookingId).emit('receive_message', newMessage);
      
    } catch (err) {
      console.error("Socket Chat Error:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User Disconnected', socket.id);
  });
});

// Controller mein access ke liye global set (useful for status notifications)
app.set('socketio', io);

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Mount Routes ---
app.use('/api/auth', require('./src/routes/authRoute'));
app.use('/api/services', require('./src/routes/serviceRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/provider', require('./src/routes/providerRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes')); 

// --- NEW: AI Route for Business Consultant ---
app.use('/api/ai', require('./src/routes/aiRoutes')); 

// Root Route
app.get('/', (req, res) => {
  res.send('Clickit API with Real-time Chat & AI Assistant is running...');
});

// Error Handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Listen using HTTP server (Not app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});