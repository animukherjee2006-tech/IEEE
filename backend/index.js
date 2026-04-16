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
const server = http.createServer(app);

// 🔥 IMPORTANT: FRONTEND URL (RENDER)
const FRONTEND_URL = "https://ieee-frontendd.onrender.com";

// --- Socket.io Setup (FIXED FOR PRODUCTION) ---
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// --- Socket Connection Logic ---
io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  socket.on('join_room', (bookingId) => {
    socket.join(bookingId);
    console.log(`👤 Joined room: ${bookingId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { bookingId, senderId, receiverId, text } = data;

      const newMessage = await Message.create({
        bookingId,
        sender: senderId,
        receiver: receiverId,
        text
      });

      io.to(bookingId).emit('receive_message', newMessage);

    } catch (err) {
      console.error("Socket Chat Error:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User Disconnected', socket.id);
  });
});

// Global socket access
app.set('socketio', io);

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());

// 🔥 FIXED CORS FOR FRONTEND (IMPORTANT)
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Routes ---
app.use('/api/auth', require('./src/routes/authRoute'));
app.use('/api/services', require('./src/routes/serviceRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/provider', require('./src/routes/providerRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('Clickit API with Real-time Chat & AI Assistant is running...');
});

// Error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// PORT (Render safe)
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
