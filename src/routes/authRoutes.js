// import express from "express";
// import { registerUser, loginUser, verifyOTP, getProfile, sendLoginOTP,verifyLoginOTP, resendOTP, forgotPassword, resetPassword, sendPhoneLoginOTP, verifyPhoneLoginOTP} from "../controllers/authController.js";
// import authMiddleware from "../middleware/authMiddleware.js";


// const router = express.Router();
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/verify-otp", verifyOTP);
// router.get(
//   "/profile",
//   authMiddleware,
//   getProfile
// );
// router.post("/send-login-otp", sendLoginOTP);
// router.post("/verify-login-otp", verifyLoginOTP);
// router.post("/resend-otp", resendOTP);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);
// router.post("/send-phone-otp", sendPhoneLoginOTP);

// router.post("/verify-phone-otp", verifyPhoneLoginOTP);
// router.get("/profile", authMiddleware, (req, res) => {
//   // res.status(200).json({
//   //   success: true,
//   //   message: "Profile Access Granted",
//   //   user: req.user,
//   // });
// });
// export default router;


import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  getProfile,
  sendLoginOTP,
  verifyLoginOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  sendPhoneLoginOTP,
  verifyPhoneLoginOTP,
  refreshToken
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);

router.get("/profile", authMiddleware, getProfile);

router.post("/send-login-otp", sendLoginOTP);
router.post("/verify-login-otp", verifyLoginOTP);

router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/send-phone-otp", sendPhoneLoginOTP);
router.post("/verify-phone-otp", verifyPhoneLoginOTP);
router.post("/refresh-token", refreshToken);
export default router;