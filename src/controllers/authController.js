import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { sendPhoneOTP } from "../utils/sendphoneOTP.js";
import { verifyPhoneOTP } from "../utils/verifyPhoneOTP.js";
import { generateAccessToken,generateRefreshToken,} from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone }],
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      await User.deleteOne({ _id: existingUser._id });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    try {
      await sendEmail(normalizedEmail, otp);

      return res.status(201).json({
        success: true,
        message: "Registration successful. OTP sent to your email.",
          user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
  },
      });
    } catch (emailError) {
      console.error("OTP email failed:", emailError.message);

      return res.status(201).json({
        success: true,
        message:
          "Registration successful, but the OTP email could not be sent. Please contact support if you do not receive it.",
         user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
  },
      });
      
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check Email Verification
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: false, // Production me true
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
      const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });
  

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

if (String(user.otp) !== String(otp)) {
  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
}

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -otp -otpExpiry",
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    await sendEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "Login OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // FIX: pehle yaha 'refreshToken' naam ka koi local variable nahi tha,
    // isliye JS neeche defined 'refreshToken' controller function ko utha raha tha.
    // Ab dono tokens sahi tarike se generate ho rahe hain, jaise loginUser aur
    // verifyPhoneLoginOTP mein hote hain.
    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: false, // Production me true
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Update OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Send Email
    await sendEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate Email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Send OTP
    await sendEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and New Password are required",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // OTP Check
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP Expiry Check
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendPhoneLoginOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log("Phone number received:", phone); // Debugging line
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const user = await User.findOne({ phone });
    console.log("User found:", user); // Debugging line
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await sendPhoneOTP(phone, otp);

    user.otp = otp.toString();
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPhoneLoginOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    console.log("Phone and OTP received:", phone, otp);

    const result = await verifyPhoneOTP(phone, otp);

    console.log("OTP verification result:", result);

    if (result.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }


    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Generate Access Token
    const accessToken = generateAccessToken(user._id);


    // Generate Refresh Token
    const refreshTokenValue = generateRefreshToken(user._id);


    // Store refresh token in cookie
    res.cookie("refreshToken", refreshTokenValue, {
      httpOnly: true,
      secure: false, 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });


  } catch (error) {

    console.log("Phone OTP Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = generateAccessToken(
      decoded.userId
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });

  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

