import express from "express";
import {
  userRegister,
  verifyUserOtp,
  resendUserOtp,
  updateUserEmail,
  userLogin,
  userLogout,
  getUserDetails,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/user/register", userRegister);
userRouter.post("/user/verify-otp", verifyUserOtp);
userRouter.post("/user/resend-otp", resendUserOtp);
userRouter.post("/user/update-email", updateUserEmail);
userRouter.post("/user/login", userLogin);
userRouter.post("/user/logout", userLogout);
userRouter.post("/user/get-user", getUserDetails);

export default userRouter;
