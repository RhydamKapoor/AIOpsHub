const express = require('express');
const router = express.Router();
const { signup, login, logout, getCurrentUser, sendOtp, verifyOTP, createNewPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const guest = require('../middleware/guest');

// Public routes (only accessible to guests)
router.post("/register", guest, signup);
router.post("/login", guest, login);

// Protected routes (only accessible to authenticated users)
router.get("/me", auth, getCurrentUser);
router.post("/logout", auth, logout);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOTP);
router.post("/newPassword", createNewPassword);

module.exports = router;