import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
    rideOtp: { type: String, default: "" },
    pickup: { address: String, lat: String, lng: String },
    destination: { address: String, lat: String, lng: String },
    fare: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);
