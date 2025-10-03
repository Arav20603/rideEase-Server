import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
  },
  rideOtp: {
    type: String,
    default: ''
  },
  pickup: {
    address: { type: String },
    lat: { type: String, required: true },
    lng: { type: String, required: true },
  },
  destination: {
    address: { type: String },
    lat: { type: String, required: true },
    lng: { type: String, required: true },
  },
  fare: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
    default: "pending",
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
