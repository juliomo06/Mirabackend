const express = require('express');
const Booking = require('../models/bookingModel');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// gcash
const gcashDir = path.join(__dirname, '../../gcash');
if (!fs.existsSync(gcashDir)) {
  fs.mkdirSync(gcashDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'gcash/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  },
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, 
});

// BOOKING
router.post('/', upload.single('gcashScreenshot'), async (req, res) => {
  try {
    const {
      userId, 
      resortId,
      resortName,
      checkInDate,
      checkOutDate,
      totalCost,
      paymentMethod,
      gcashRefNumber,
      bookingReference,
      swimmingType,
    } = req.body;

    if (!userId || !resortId || !checkInDate || !checkOutDate || !totalCost) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const gcashScreenshot = req.file ? req.file.filename : null; 


    const newBooking = new Booking({
      userId,
      resortId,
      resortName, 
      checkInDate,
      checkOutDate,
      totalCost,
      paymentMethod,
      gcashRefNumber,
      gcashScreenshot, 
      bookingReference,
      swimmingType,
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId resortId'); 
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});


// get count confirm books
router.patch('/:bookingId/confirmed', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).send('Booking not found');
    }
    booking.status = 'confirmed'; 
    await booking.save();
    res.status(200).send(booking);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Cancel booking
router.patch('/:bookingId/cancelled', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).send('Booking not found');
    }
    booking.status = 'cancelled'; 
    await booking.save();
    res.status(200).send(booking);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Status Count
router.get('/confirmed/count', async (req, res) => {
  try {
    const confirmedCount = await Booking.countDocuments({ status: 'confirmed' });
    res.json({ count: confirmedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get confirmed reservation count' });
  }
});

router.get('/pending/count', async (req, res) => {
  try {
    const pendingCount = await Booking.countDocuments({ status: 'pending' });
    res.json({ count: pendingCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get pending reservation count' });
  }
});
// Get top-performing resorts based on confirmed bookings
router.get('/top-resorts', async (req, res) => {
  try {
    const topResorts = await Booking.aggregate([
      { $match: { status: 'confirmed' } }, // Match only confirmed bookings
      { 
        $group: {
          _id: "$resortId", // Group by resortId
          count: { $sum: 1 } // Count the number of bookings
        }
      },
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 3} // Limit to top 5 resorts, adjust as needed
    ]);

    // Populate the resort details for each resortId
    const populatedResorts = await Booking.populate(topResorts, { path: '_id', model: 'Resort' });

    res.status(200).json(populatedResorts);
  } catch (error) {
    console.error("Error fetching top-performing resorts:", error);
    res.status(500).json({ message: 'Error fetching top-performing resorts', error: error.message });
  }
});




module.exports = router;
