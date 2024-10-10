const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { sendWelcomeEmail, transporter, generateVerificationCode } = require('../routes/mailer');
const router = express.Router();

//register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["user", "admin", "moderator"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, email, password, role } = req.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = generateVerificationCode(); 
      console.log("Generated verification code:", verificationCode);
      const user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        role, 
        verificationCode 
      });
      await user.save();
      await sendWelcomeEmail(email, name, verificationCode); 
      // console.log("Email sent to:", email, "with code:", verificationCode);
      res.status(201).json({ message: "User registered. Please verify your email." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
//login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });
      if (!user.isVerified) {
        return res.status(403).json({ message: "Please verify your email to log in." });
      }
      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        "bezkoder-secret-key",
        { expiresIn: "1h" }
      );
      res.json({ token, role: user.role, userId: user._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
//verify
router.post("/verify", [
  body("verificationCode").notEmpty().withMessage("Verification code is required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code or email" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/send-email', async (req, res) => {
  const { name, email, subject, contact, message } = req.body;

  const mailOptions = {
      from: email, 
      to: process.env.EMAIL_USER,
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\nContact: ${contact}\n\nMessage:\n${message}`,
  };

  try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Email sent successfully!');
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email: ' + error.message);
  }
});


module.exports = router;
