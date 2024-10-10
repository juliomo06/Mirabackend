const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");


const isAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, "bezkoder-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    req.user = {
      id: decoded.id,
      name: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isVerified: true,
    };

    next();
  });
};

const getUserDetails = async (req, res) => {
  try {
    const moderators = await User.find({ role: 'moderator' });
    if (moderators.length === 0) {
      return res.status(404).json({ message: "No moderators found" });
    }
    const moderatorDetails = moderators.map(moderator => ({
      _id: moderator._id, 
      email: moderator.email,
      name: moderator.name,
      role: moderator.role,
    }));
    res.json(moderatorDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createModerator = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newModerator = new User({
      name,
      email,
      password: hashedPassword, 
      role: 'moderator',
      isVerified: true,
    });

    await newModerator.save();
    res.status(201).json({ message: "Moderator created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//deletee
const deleteModerator = async (req, res) => {
  const { id } = req.params;

 
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid moderator ID" });
  }

  try {
    const moderator = await User.findById(id);

    if (!moderator || moderator.role !== 'moderator') {
      return res.status(404).json({ message: "Moderator not found" });
    }
    await User.deleteOne({ _id: id });
    return res.status(200).json({ message: "Moderator deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  isAdmin,
  getUserDetails,
  createModerator,
  deleteModerator
};
