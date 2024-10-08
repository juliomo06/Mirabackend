const mongoose = require("mongoose");

const ResortSchema = new mongoose.Schema({
  name: String,
  pax: Number,
  priceMin: Number,
  priceMax: Number,
  details: String,
  images: [{ path: String }],
  moderatorId: { type: mongoose.Schema.Types.ObjectId, required: true } 
});



module.exports = mongoose.model("Resort", ResortSchema);
