import bcrypt from "bcryptjs";
import Rider from "../models/rider.model.js";
import transporter from "../config/nodemailer.js"

/* Helper */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/* REGISTER */
export const registerRider = async (req, res) => {
  const { name, email, phone, password, vehicle } = req.body;

  if (!name || !phone || !password || !vehicle?.type || !vehicle?.plateNumber) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingRider = await Rider.findOne({ $or: [{ email }, { phone }] });
    if (existingRider) {
      return res.json({ success: false, message: "Rider already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const rider = new Rider({
      name,
      email,
      phone,
      password: hashedPassword,
      vehicle: {
        type: vehicle.type,
        plateNumber: vehicle.plateNumber,
      },
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    await rider.save();

    const mailOptions = {
      from: '"Ride App" <dakshandaravind@gmail.com>',
      to: email,
      subject: "Verify your Ride App account",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    };

    await transporter.sendMail(mailOptions)

    return res.json({ success: true, message: "Rider registered. Please verify OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* VERIFY OTP */
export const verifyRiderOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.json({ success: false, message: "Email and OTP required" });

  try {
    const rider = await Rider.findOne({ email });
    if (!rider) return res.json({ success: false, message: "Rider not found" });

    if (rider.isVerified) return res.json({ success: true, message: "Rider already verified" });

    if (rider.otp !== otp || Date.now() > rider.otpExpireAt) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    rider.isVerified = true;
    rider.otp = undefined;
    rider.otpExpiry = undefined;
    await rider.save();

    return res.json({ success: true, message: "Rider verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* RESEND OTP */
export const resendRiderOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });

  try {
    const rider = await Rider.findOne({ email });
    if (!rider) return res.json({ success: false, message: "Rider not found" });
    if (rider.isVerified) return res.json({ success: false, message: "Rider already verified" });

    const otp = generateOtp();
    rider.otp = otp;
    rider.otpExpiry = Date.now() + 5 * 60 * 1000;
    await rider.save();

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

/* UPDATE EMAIL */
export const updateRiderEmail = async (req, res) => {
  const { oldEmail, newEmail } = req.body;
  if (!oldEmail || !newEmail)
    return res.json({ success: false, message: "Old and new email required" });

  try {
    const rider = await Rider.findOne({ email: oldEmail });
    if (!rider) return res.json({ success: false, message: "Rider not found" });

    rider.email = newEmail;
    rider.isVerified = false;

    const otp = generateOtp();
    rider.otp = otp;
    rider.otpExpiry = Date.now() + 5 * 60 * 1000;
    await rider.save();

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

/* LOGIN */
export const loginRider = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "Email and password are required" });

  try {
    const rider = await Rider.findOne({ email });
    if (!rider) return res.json({ success: false, message: "Rider does not exist" });

    if (!rider.isVerified) {
      return res.json({ success: false, message: "Please verify your email before login" });
    }

    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    return res.json({
      success: true,
      message: "Rider successfully logged in",
      rider: { ...rider._doc, password: undefined, otp: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* LOGOUT */
export const logoutRider = async (req, res) => {
  try {
    return res.json({ success: true, message: "Rider successfully logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRiderDetails = async (req, res) => {
  const { email } = req.body
  try {
    const user = await Rider.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: "Rider does not exist" });
    }
    return res.json({
      success: true,
      user: { ...user._doc, password: undefined, otp: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
