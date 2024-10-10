const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, 
});

module.exports = mongoose.model("User", userSchema);