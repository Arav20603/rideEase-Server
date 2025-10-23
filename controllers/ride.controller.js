import Ride from "../models/ride.model.js";

// Create ride
export const createRide = async (req, res) => {
  try {
    const { userId, riderId, pickup, destination, fare, rideOtp } = req.body;
    if (!userId || !riderId || !pickup || !destination || !fare || !rideOtp) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const ride = await Ride.create({
      user: userId,
      rider: riderId,
      pickup,
      destination,
      fare,
      rideOtp,
      status: "pending"
    });

    res.status(201).json({ success: true, ride });
  } catch (error) {
    console.error("❌ Ride creation failed:", error);
    res.status(500).json({ success: false, message: "Ride creation failed", error });
  }
};

// Complete ride
export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    ride.status = "completed";
    ride.completedAt = new Date();
    await ride.save();

    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ride completion failed", error });
  }
};

// Cancel ride
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

    ride.status = "cancelled";
    await ride.save();

    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ride cancellation failed", error });
  }
};
