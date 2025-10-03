import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["cash", "card", "wallet", "upi"],
    default: "cash",
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  transactionId: {
    type: String,
  },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
