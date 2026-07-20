import twilio from "twilio";
import User from "../models/User.js";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export const verifyPhoneOTP = async (phone, otp) => {
  let user = await User.findOne({
    phone: phone,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.otp || !user.otpExpiry) {
    throw new Error("OTP not found. Please request a new OTP.");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP. Please try again.");
  }

  if (user.otpExpiry < new Date()) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  // If OTP is valid, clear the OTP and expiry fields
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return {
    status: "approved",
    message: "OTP verified successfully",
  };
};
