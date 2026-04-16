const Booking = require('../models/Booking');

const getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user.id; // Middleware se aayega

    // 1. Fetch all bookings for this provider
    const bookings = await Booking.find({ provider: providerId }).populate('consumer', 'name email');

    // 2. Calculate Stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.price, 0);
    const thisMonthBookings = bookings.filter(b => {
        const d = new Date(b.createdAt);
        return d.getMonth() === new Date().getMonth();
    }).length;

    res.status(200).json({
      success: true,
      user: { name: req.user.name },
      stats: {
        earnings: totalEarnings,
        totalBookings: totalBookings,
        rating: 4.8, // Abhi dummy, baad mein Review model se aayega
        thisMonth: thisMonthBookings
      },
      appointments: bookings.map(b => ({
        _id: b._id,
        customerName: b.consumer.name,
        serviceType: b.serviceType,
        date: b.date,
        time: b.time,
        price: b.price,
        status: b.status
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProviderDashboard };