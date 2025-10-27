import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.routes.js";
import riderRouter from "./routes/rider.routes.js";
import { Server } from "socket.io";
import rideRouter from "./routes/ride.routes.js";
import rideModel from "./models/ride.model.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('user_request', (msg) => {
    console.log('user request', msg)
    io.emit('user_request', msg)
  })

  socket.on('ride_accept', (msg) => {
    console.log('ride accepted', msg)
    io.emit('ride_accept', msg)
  })

  socket.on('rider_location', (data) => {
    console.log('rider location:', data)
    io.emit('rider_location', data)
  })

  socket.on('ride_start', (msg) => {
    io.emit('ride_start', msg)
    console.log(msg)
  })

  socket.on('rider_cancelled_ride', (msg) => {
    io.emit('rider_cancelled_ride', msg)
  })

  socket.on('user_cancelled_ride', (msg) => {
    io.emit('user_cancelled_ride', msg)
  })

  socket.on('ride_complete', (msg) => {
    io.emit('ride_complete', msg)
  })

  socket.on('multi_user_request', (payload) => {
    console.log('multi_user_request received', payload.bookingId, 'segments:', payload.segments?.length);

    if (!payload?.segments || !Array.isArray(payload.segments)) {
      return;
    }

    let cumulativeDelay = 0;

    payload.segments.forEach((segment, i) => {
      const segDurationMs = Math.max((segment.durationSec || 10) * 1000, 8000);
      const emitDelay = cumulativeDelay;

      setTimeout(() => {
        const msg = {
          bookingId: payload.bookingId,
          segmentIndex: i,
          totalSegments: payload.segments.length,
          segment,
          origin: payload.origin,
          destination: payload.destination,
          user: payload.user,
          createdAt: payload.createdAt,
        };
        console.log('Emitting user_request for segment', i, msg.bookingId);
        io.emit('user_request', msg);
      }, emitDelay);

      cumulativeDelay += segDurationMs;
    });

    io.emit('multi_sequence_started', {
      bookingId: payload.bookingId,
      totalSegments: payload.segments.length,
      startedAt: new Date().toISOString(),
    });
  });


  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
});

// REST routes
app.use("/ride", userRouter);
app.use("/ride", riderRouter);
app.use("/ride", rideRouter);

app.get('/ride/get', async (req, res) => {
  try {
    const data = await rideModel.find()
    if (!data) return res.status(500).json({ success: false, msg: 'data fetch failed' })
    res.status(201).json({ success: true, msg: 'found all collection', data })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: 'deletion failed' })
  }
})

app.post('/ride/deleteall', async (req, res) => {
  try {
    await rideModel.deleteMany({})
    res.status(201).json({ success: true, msg: 'deleted all collection' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, msg: 'deletion failed' })
  }
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server listening on ${PORT}`);
});
