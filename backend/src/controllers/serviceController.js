const Service = require('../models/Service');
const User = require('../models/User');
const Booking = require('../models/Booking');

// ================= CREATE SERVICE =================
const createService = async (req, res) => {
  try {
    const { title, category, description, price, location, image } = req.body;

    if (!title || !category || !price || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const service = await Service.create({
      provider: req.user.id, // Auth middleware se user id
      title,
      category,
      description,
      price,
      location,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not create service",
    });
  }
};

// ================= GET ALL SERVICES (Marketplace / Explore) =================
const getAllServices = async (req, res) => {
  try {
    const { category, search, location } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const services = await Service.find(query)
      .populate('provider', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch services",
    });
  }
};

// ================= GET SERVICE BY ID =================
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET PROVIDER PROFILE & DASHBOARD DATA =================
const getProviderProfile = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await User.findById(providerId).select('name email');
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    const services = await Service.find({ provider: providerId });
    
    // Sabhi bookings fetch karo
    const appointments = await Booking.find({ provider: providerId }).sort('-createdAt');

    // --- DYNAMIC CALCULATIONS ---
    
    // 1. Total Jobs (Sirf wahi jo confirm ya complete ho chuki hain)
    const completedJobsList = appointments.filter(apt => apt.status === 'completed');
    const totalJobsCount = completedJobsList.length;

    // 2. Revenue (Sirf completed jobs ka total price sum karo)
    const totalRevenue = completedJobsList.reduce((acc, apt) => acc + (apt.price || 0), 0);

    // 3. Dynamic Rating
    let dynamicRating = 0;
    if (services.length > 0) {
      const total = services.reduce((acc, s) => acc + (s.rating || 0), 0);
      dynamicRating = (total / services.length).toFixed(1);
    }

    res.status(200).json({
      success: true,
      provider,
      services,
      appointments,
      stats: {
        totalServices: services.length,
        completedJobs: totalJobsCount, // Ab ye real count bhejega
        revenue: totalRevenue,         // Naya field: Total Paisa
        rating: dynamicRating || 0 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= RATE SERVICE (With Socket Notification) =================
const rateService = async (req, res) => {
  try {
    const { providerId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating" });
    }

    const services = await Service.find({ provider: providerId });

    if (services.length === 0) {
      return res.status(404).json({ success: false, message: "No services found for this provider" });
    }

    // Har service par rating update karo
    for (let service of services) {
      const oldTotalPoints = (service.rating || 0) * (service.reviewsCount || 0);
      service.reviewsCount = (service.reviewsCount || 0) + 1;
      
      const newAvg = (oldTotalPoints + Number(rating)) / service.reviewsCount;
      service.rating = Number(newAvg.toFixed(1)); 
      
      await service.save();
    }

    // --- SOCKET.IO NOTIFICATION ---
    const io = req.app.get('socketio');
    if (io) {
      io.to(providerId).emit('receive_notification', {
        title: 'New Review!',
        message: `Someone gave you a ${rating} star rating!`,
        type: 'RATING_UPDATE'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Rating updated successfully across all services!" 
    });
  } catch (err) {
    console.error("Rating Error:", err.message);
    res.status(500).json({ success: false, message: "Server error while rating" });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  getProviderProfile,
  rateService
};