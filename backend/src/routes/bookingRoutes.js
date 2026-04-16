const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getMyBookings, 
  getProviderRequests, 
  updateBookingStatus 
} = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/requests', getProviderRequests);

// Ye wala route Dashboard.jsx ke axios.patch call se match hona chahiye
router.patch('/update-status/:id', updateBookingStatus);

module.exports = router;