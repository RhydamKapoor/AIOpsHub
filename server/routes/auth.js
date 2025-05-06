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
    slackAuthCallback,
    updateProfile,
    changePassword
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

// Add detailed error logging for Slack routes
router.get('/slack', (req, res, next) => {
  console.log('Slack auth route accessed');
  try {
    passport.authenticate('Slack')(req, res, next);
  } catch (error) {
    console.error('Error in Slack auth route:', error);
    next(error);
  }
});

router.get('/slack/callback', 
  (req, res, next) => {
    console.log('Slack callback route accessed');
    try {
      passport.authenticate('Slack', { 
        failureRedirect: `${process.env.CLIENT_DEV || process.env.CLIENT_PROD}/login`,
        session: false 
      })(req, res, next);
    } catch (error) {
      console.error('Error in Slack callback route:', error);
      next(error);
    }
  },
  slackAuthCallback
);

// Protected routes (only accessible to authenticated users)
router.get("/me", auth, getCurrentUser);
router.post("/logout", auth, logout);
router.post("/updateuser", auth, updateProfile);
router.post("/changepassword", auth, changePassword);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOTP);
router.post("/newPassword", createNewPassword);

module.exports = router;