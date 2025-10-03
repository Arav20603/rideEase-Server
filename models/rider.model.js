import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  vehicle: {
    type: { type: String, enum: ["car", "bike", "auto"], required: true },
    plateNumber: { type: String, unique: true, required: true }
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: "" },
  otpExpiry: { type: Date }
}, { timestamps: true });

const Rider = mongoose.model("Rider", riderSchema);
export default Rider;
