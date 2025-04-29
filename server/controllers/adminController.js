const User = require("../models/User");
const nodemailer = require("nodemailer");

exports.allUsers = async(req, res) => {
    try {
         const users = await User.find();
         res.status(200).json({ msg: 'Users are found', users});
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

exports.sendInvitation = async(req, res) => {
    try {
        const {email, role} = req.body;

        const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>AIOpsHub Invitation</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; }
              .container { max-width: 600px; background-color: #ffffff; padding: 30px; margin: 0 auto; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .btn { display: inline-block; padding: 12px 20px; margin-top: 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; }
              .footer { font-size: 12px; color: #888888; margin-top: 30px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>You're Invited to Join AIOpsHub</h2>
              <p>Hi,</p>
              <p>You've been invited to join <strong>AIOpsHub</strong>, your all-in-one platform for AI-powered operations and collaboration.</p>
              <p>Click the button below to accept your invitation and get started:</p>
              <a href="${process.env.CLIENT_URL}/signup?role=${role}" class="btn">Accept Invitation</a>
              <p>If you weren't expecting this invitation, feel free to ignore this email.</p>
              <div class="footer">© 2025 AIOpsHub. All rights reserved.</div>
            </div>
          </body>
        </html>`;

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
      subject: "You're Invited to Join AIOpsHub",
      html
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: "Email sent" });
    } catch (error) {
      res.status(500).json({ msg: "Email couldn't be sent" });
    }
}

exports.changeRole = async (req, res) => {
  try {
    const { id, newRole } = req.body;

    const user = await User.findByIdAndUpdate(id, { role: newRole });

    if (!user) {
      return res.status(404).json({ msg: "User not found" }); // <-- return here
    }

    return res.status(200).json({ msg: "Role changed successfully", user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};