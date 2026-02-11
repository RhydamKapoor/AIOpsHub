const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { SignJWT } = require("jose");

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const ONE_DAY = 24 * 60 * 60 * 1000;

/* ----------------------------------------------------
   Helper: Create JWT
---------------------------------------------------- */
const createToken = async (userWithoutPassword) => {
  return await new SignJWT({ details: userWithoutPassword })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
};

/* ----------------------------------------------------
   Signup
---------------------------------------------------- */
exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
    });

    res.status(200).json({ msg: "User created", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Login
---------------------------------------------------- */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const { password: _, ...userWithoutPassword } = user._doc;

    const token = await createToken(userWithoutPassword);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: ONE_DAY,
      path: "/",
    });

    res.json({
      msg: "Login successful",
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Get Current User
---------------------------------------------------- */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user.details;
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Logout
---------------------------------------------------- */
exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    expires: new Date(0),
    path: "/",
  });

  res.json({ msg: "Logged out successfully" });
};

/* ----------------------------------------------------
   Update Profile
---------------------------------------------------- */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.details._id;
    const { firstName, lastName, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser._doc;

    const token = await createToken(userWithoutPassword);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: ONE_DAY,
      path: "/",
    });

    res.json({ msg: "Profile updated", user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/* ----------------------------------------------------
   Change Password
---------------------------------------------------- */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.details._id);
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Force logout
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      expires: new Date(0),
      path: "/",
    });

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Send OTP
---------------------------------------------------- */
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    res.cookie("otpData", JSON.stringify({ email, otp }), {
      maxAge: 3 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `<h1>Password Reset</h1><p>Your OTP is <b>${otp}</b></p>`,
    });

    res.json({ msg: "Email sent" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Verify OTP
---------------------------------------------------- */
exports.verifyOTP = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const stored = req.cookies.otpData;
    if (!stored) return res.status(400).json({ msg: "OTP expired" });

    const parsed = JSON.parse(stored);
    if (parsed.email !== email || parsed.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    res.clearCookie("otpData");
    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Create New Password
---------------------------------------------------- */
exports.createNewPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Google OAuth Success
---------------------------------------------------- */
exports.googleAuthCallback = async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user._doc;

    const token = await createToken(userWithoutPassword);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: ONE_DAY,
      path: "/",
    });

    res.redirect(
      `${process.env.CLIENT_DEV || process.env.CLIENT_PROD}/auth-success`
    );
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ----------------------------------------------------
   Slack OAuth Success
---------------------------------------------------- */
exports.slackAuthCallback = async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user._doc;

    const token = await createToken(userWithoutPassword);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: ONE_DAY,
      path: "/",
    });

    res.redirect(
      `${process.env.CLIENT_DEV || process.env.CLIENT_PROD}/auth-success`
    );
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};