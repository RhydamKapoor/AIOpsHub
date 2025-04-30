const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
    signup, 
    login, 
    logout, 
    getCurrentUser, 
    sendOtp, 
    verifyOTP, 
    createNewPassword,
    googleAuthCallback,
    slackAuthCallback
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const guest = require('../middleware/guest');

// Public routes (only accessible to guests)
router.post("/register", guest, signup);
router.post("/login", guest, login);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_DEV || process.env.CLIENT_PROD}/login`,
    session: false 
  }),
  googleAuthCallback
);

router.get('/slack', passport.authenticate('slack'));
router.get('/slack/callback', 
  passport.authenticate('slack', { 
    failureRedirect: `${process.env.CLIENT_DEV || process.env.CLIENT_PROD}/login`,
    session: false 
  }),
  slackAuthCallback
);

// Protected routes (only accessible to authenticated users)
router.get("/me", auth, getCurrentUser);
router.post("/logout", auth, logout);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOTP);
router.post("/newPassword", createNewPassword);

module.exports = router;