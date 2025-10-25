import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   mode: { type: String, enum: ['cash', 'upi'] },
//   status: { type: String, enum: ['completed', 'pending'], default: 'pending' }
// })

const rideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
    rideOtp: { type: String, default: "" },
    pickup: { address: String, lat: String, lng: String },
    destination: { address: String, lat: String, lng: String },
    fare: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    paymentMode: { type: String, enum: ['cash', 'upi'], default: 'cash' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);
