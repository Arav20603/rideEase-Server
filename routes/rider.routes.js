import express from "express";
import {
  registerRider,
  verifyRiderOtp,
  resendRiderOtp,
  updateRiderEmail,
  loginRider,
  logoutRider,
  getRiderDetails,
} from "../controllers/rider.controller.js";

const riderRouter = express.Router();

riderRouter.post("/rider/register", registerRider);
riderRouter.post("/rider/verify-otp", verifyRiderOtp);
riderRouter.post("/rider/resend-otp", resendRiderOtp);
riderRouter.post("/rider/update-email", updateRiderEmail);
riderRouter.post("/rider/login", loginRider);
riderRouter.post("/rider/logout", logoutRider);
riderRouter.post("/rider/get-rider", getRiderDetails);

export default riderRouter;
