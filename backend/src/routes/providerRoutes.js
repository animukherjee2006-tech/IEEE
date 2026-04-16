const express = require('express');
const router = express.Router();

const {getProviderDashboard }= require('../controllers/providerController'); // ✅ FIX
const { updateBookingStatus } = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');

router.get('/dashboard-data', protect, getProviderDashboard);

router.patch('/booking-status/:id', protect, updateBookingStatus);

module.exports = router;