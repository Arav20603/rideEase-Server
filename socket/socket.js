import { v4 as uuidv4 } from "uuid";

export default function initSockets(io) {
  const riders = new Map(); // riderId -> { socketId, vehicleType, name }
  const users = new Map();  // userId -> socketId

  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    // Rider registration
    socket.on("register_rider", ({ riderId, name, vehicleType }) => {
      riders.set(riderId, { socketId: socket.id, vehicleType, name });
      console.log(`🟢 Rider registered: ${name} (${vehicleType})`);
    });

    // User registration
    socket.on("register_user", ({ userId }) => {
      users.set(userId, socket.id);
      console.log(`🟢 User registered: ${userId}`);
    });

    // User ride request
    socket.on("ride_request", ({ userId, origin, destination, vehicle, price, time }) => {
      const rideId = uuidv4();
      const rideData = { rideId, userId, origin, destination, vehicle, price, time };

      console.log("📥 Ride request:", rideData);

      // Send only to riders with matching vehicle
      for (const [riderId, rider] of riders.entries()) {
        if (rider.vehicleType.toLowerCase() === vehicle.toLowerCase()) {
          io.to(rider.socketId).emit("new_ride", rideData);
          console.log(`📤 Sent ride to rider ${riderId}`);
        }
      }
    });

    // Rider accepts/rejects ride
    socket.on("ride_response", ({ rideId, riderId, accept, userId }) => {
      console.log(`📡 Rider ${riderId} responded to ride ${rideId}: ${accept}`);

      const userSocket = users.get(userId);
      if (userSocket) {
        io.to(userSocket).emit("ride_response", { rideId, riderId, accept });
      }
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      for (const [riderId, rider] of riders.entries()) {
        if (rider.socketId === socket.id) riders.delete(riderId);
      }
      for (const [userId, userSocket] of users.entries()) {
        if (userSocket === socket.id) users.delete(userId);
      }
      console.log("❌ Disconnected:", socket.id);
    });
  });
}
