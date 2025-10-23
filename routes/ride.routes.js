import express from "express";
import { createRide, cancelRide, completeRide } from "../controllers/ride.controller.js";

const rideRouter = express.Router();

rideRouter.post("/rides/create", createRide)
rideRouter.patch("/rides/cancel/:rideId", cancelRide)
rideRouter.patch("/rides/complete/:rideId", completeRide);

export default rideRouter;
