const jwt = require('jsonwebtoken');

const guest = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (token) {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        // If token is valid, redirect to home
        return res.status(302).json({ 
          redirect: true, 
          msg: 'You are already logged in',
          redirectTo: '/' 
        });
      }
    }
    next();
  } catch (err) {
    // If token is invalid, allow the request to proceed
    next();
  }
};

module.exports = guest; 