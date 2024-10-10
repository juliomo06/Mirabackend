
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};

const sendWelcomeEmail = (to, name, verificationCode) => { // Receive verificationCode as a parameter
  const mailOptions = {
    from: '"Your App Name" <no-reply@example.com>',
    to,
    subject: 'Welcome to Our Service! Please Verify Your Email',
    text: `Hello ${name},\n\nThank you for registering with us! Please verify your email using the following code:\n\n${verificationCode}\n\nBest regards,\nYour App Name`,
    html: `<p>Hello <strong>${name}</strong>,</p><p>Thank you for registering with us! Please verify your email using the following code:</p><h3>${verificationCode}</h3><p>Best regards,<br>Your App Name</p>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendWelcomeEmail, generateVerificationCode };
