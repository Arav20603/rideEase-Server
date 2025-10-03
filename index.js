import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.routes.js";
import riderRouter from "./routes/rider.routes.js";
import { Server } from "socket.io";

dotenv.config();

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

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
});

// REST routes
app.use("/ride", userRouter);
app.use("/ride", riderRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🚀 Server listening on ${PORT}`);
  await connectDB();
});
