const express = require('express');
const router = express.Router();

const {
  createService,
  getAllServices,
  getServiceById,
  getProviderProfile,
  rateService // <--- Ye naya controller function add hoga
} = require('../controllers/serviceController');

const protect = require('../middleware/authMiddleware');

// ================= ROUTES =================

// 1. Create service (Provider only)
router.post('/create', protect, createService);

// 2. Rate a Service (Consumer only - Jab service complete ho jaye)
// Path: /api/services/rate
router.post('/rate', protect, rateService); 

// 3. Provider Profile (Specific Path)
// Isko /:id se hamesha upar rakho taaki clash na ho
router.get('/provider-profile/:providerId', protect, getProviderProfile);

// 4. Get all services
router.get('/', protect, getAllServices);

// 5. Get single service (Catch-all ID)
// Isko hamesha sabse niche rakho
router.get('/:id', protect, getServiceById);

module.exports = router;