import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: "" },
  otpExpiry: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
