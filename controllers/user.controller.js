import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import transporter from '../config/nodemailer.js';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const userRegister = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !password || !email || !phone)
    return res.json({ success: false, message: "Missing details" });

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = new User({
      name, email, phone,
      password: hashedPassword,
      otp, otpExpiry,
      isVerified: false
    });

    await user.save();

    // send OTP email
    const mailOptions = {
      from: '"Ride App" <dakshandaravind@gmail.com>',
      to: email,
      subject: "Verify your Ride App account",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    };

    await transporter.sendMail(mailOptions)

    return res.json({ success: true, message: "User registered. OTP sent to email." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const verifyUserOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.json({ success: false, message: "Email and OTP required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isVerified) {
      return res.json({ success: true, message: "User already verified" });
    }

    if (user.otp !== otp || Date.now() > user.otpExpireAt) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ success: true, message: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const resendUserOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isVerified) {
      return res.json({ success: false, message: "User already verified" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: '"Ride App" <dakshandaravind@gmail.com>',
      to: email,
      subject: "Resend OTP - Ride App",
      text: `Your new OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions)

    return res.json({ success: true, message: "OTP resent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateUserEmail = async (req, res) => {
  const { oldEmail, newEmail } = req.body;
  if (!oldEmail || !newEmail)
    return res.json({ success: false, message: "Old and new email required" });

  try {
    const user = await User.findOne({ email: oldEmail });
    if (!user) return res.json({ success: false, message: "User not found" });

    user.email = newEmail;
    user.isVerified = false;

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: '"Ride App" <dakshandaravind@gmail.com>',
      to: newEmail,
      subject: "Verify new Email - Ride App",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions)

    return res.json({ success: true, message: "Email updated. Please verify new email with OTP." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User does not exist" });

    if (!user.isVerified) {
      return res.json({ success: false, message: "Please verify your email before login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    return res.json({
      success: true,
      message: "User successfully logged in",
      user: { ...user._doc, password: undefined, otp: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const userLogout = async (req, res) => {
  try {
    return res.json({ success: true, message: "User successfully logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserDetails = async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }
    return res.json({
      success: true,
      user: { ...user._doc, password: undefined, otp: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}