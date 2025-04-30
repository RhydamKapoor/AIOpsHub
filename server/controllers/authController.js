const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, password: hashed, role });
    res.status(200).json({ msg: "User created", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user._doc;

    const token = jwt.sign({ details:userWithoutPassword}, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      path: '/'
    });

    res.json({ 
      msg: "Login successful", 
      user: userWithoutPassword 
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.details._id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/'
  });
  res.json({ msg: "Logged out successfully" });
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const generateOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store both email and OTP in cookie
    const otpData = JSON.stringify({ email, otp: generateOTP });
    res.cookie('otpData', otpData, {
      maxAge: 3 * 60 * 1000, // 3 minutes in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    const html = `
    <h1>Reset Password</h1>
    <p>Your OTP is ${generateOTP}</p>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Email sent" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { otp, email } = req.body;
  try {
    const storedData = req.cookies.otpData;
    
    if (!storedData) {
      return res.status(400).json({ msg: "OTP expired or not found" });
    }

    const { email: storedEmail, otp: storedOTP } = JSON.parse(storedData);

    // Verify both email and OTP match
    if (storedEmail !== email || storedOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Clear the OTP cookie after successful verification
    res.clearCookie('otpData');
    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createNewPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
