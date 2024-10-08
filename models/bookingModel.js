const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true},
    resortId: { type: mongoose.Schema.Types.ObjectId, required: true },
    resortName: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    swimmingType: { type: String, required: true },
    totalCost: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    gcashRefNumber: { type: String }, 
    gcashScreenshot: { type: String }, 
    bookingReference: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
});


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
