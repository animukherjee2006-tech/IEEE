const Booking = require('../models/Booking');

// ================= CREATE NEW BOOKING (With Availability Check) =================
const createBooking = async (req, res) => {
  try {
    const { providerId, serviceType, date, time, price } = req.body;

    // Check availability logic
    const isBusy = await Booking.findOne({
      provider: providerId,
      date: date,
      time: time,
      status: { $in: ['pending', 'accepted', 'confirmed'] }
    });

    if (isBusy) {
      return res.status(400).json({
        success: false,
        message: "This provider is already booked for this time slot. Please choose another time."
      });
    }

    const booking = await Booking.create({
      consumer: req.user.id, 
      provider: providerId,
      serviceType,
      date,
      time,
      price
    });

    // Socket: Provider ko real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.to(providerId).emit('new_booking_received', {
        ...booking._doc,
        customerName: req.user.name, 
      });
    }

    res.status(201).json({ success: true, message: "Booking request sent!", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE BOOKING STATUS (Universal) =================
// Ye function Accept, Reject, Cancel, aur Complete sab handle karega
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body; 

    const booking = await Booking.findByIdAndUpdate(
      id, 
      { status, providerNote: message || "" }, 
      { new: true, runValidators: true }
    ).populate('consumer', 'name email').populate('provider', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const io = req.app.get('socketio');
    if (io) {
      // 1. Consumer ko notify karo (Status Update)
      io.to(booking.consumer._id.toString()).emit('booking_status_updated', {
        bookingId: id,
        status: status,
        providerNote: message
      });

      // 2. Agar status 'completed' ya 'cancelled' hai, toh provider ke active list se bhi hatna chahiye
      io.to(booking.provider._id.toString()).emit('booking_removed_from_active', { bookingId: id });
    }

    res.status(200).json({ success: true, message: `Booking ${status} successfully`, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET CONSUMER DASHBOARD DATA =================
// Isme hum Bookings + User Info + Stats ek saath bhej rahe hain
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ consumer: req.user.id })
      .populate('provider', 'name email')
      .sort('-createdAt');

    // Stats Calculate karna (Dashboard cards ke liye)
    const stats = {
      upcoming: bookings.filter(b => ['pending', 'accepted', 'confirmed'].includes(b.status)).length,
      completed: bookings.filter(b => b.status === 'completed').length,
      favorites: 0 // Future mein review system ke liye use kar sakte ho
    };

    res.status(200).json({
      success: true,
      user: { id: req.user.id, name: req.user.name },
      stats,
      bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET PROVIDER REQUESTS =================
// bookingController.js mein getProviderRequests ko update karo
const getProviderRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate('consumer', 'name email')
      .sort('-createdAt');

    // Stats calculation for Provider Dashboard
    const stats = {
      revenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((acc, curr) => acc + (curr.price || 0), 0),
      completedJobs: bookings.filter(b => b.status === 'completed').length,
      totalServices: 0, // Isse provider model se fetch kar sakte ho later
      rating: '5.0'
    };

    res.status(200).json({ success: true, bookings, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getProviderRequests
};