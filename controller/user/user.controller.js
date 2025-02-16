import User from "../../models/user.model.js";
import express from "express";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../../utils/mail.user.verify.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPass = await bcryptjs.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000);
    const newUser = new User({
      name,
      email,
      password: hashedPass,
      verifyToken: otp,
      verifyTokenExpiry: expiryDate,
    });

    const option = "VERIFY";

    await newUser.save();

    sendEmail({ email, otp, name, option, userId: newUser._id });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error occurred while registering new user:", error);

    return res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;
    if (!otp) {
      return res
        .status(400)
        .json({ message: "otp is required to do verification" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user does not exists" });
    }
    if (user.verifyToken !== otp) {
      return res.status(400).json({ message: "OTP IS NOT MATCHING" });
    }
    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;
    await user.save();
    return res.status(201).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Error occurred while verifying user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date(Date.now() + 3600000);

      sendEmail({
        email,
        otp,
        name: user.name,
        type: "VERIFY",
        userId: user._id,
      });

      user.verifyToken = otp;
      user.verifyTokenExpiry = expiryDate;
      await user.save();

      return res.status(201).json({
        message:
          "A mail has been sent with verification Number along with Link. Verify first!",
      });
    }

    const payload = {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };

    const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "User logged in", token });
  } catch (error) {
    console.error("Error occurred while logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    return res.status(200).json({ message: "User logged out" });
  } catch (error) {
    console.error("Error occurred while logging out user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const me = async (req, res) => {
  try {
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in me endpoint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const resetPasswordLinkAndOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000);
    const option = "RESET";
    const name = user.name;
    
    sendEmail({ email, otp, name, option, userId: user._id });
    
    user.passwordToken = otp;
    user.passwordTokenExpiry = expiryDate;
    await user.save();
    
    return res.status(200).json({ message: "Password reset link sent to your email" });
    
  } catch (error) {
    console.error("Error in reset password email sending endpoint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const resetPass = async (req, res) => {
  try {
    const { userId } = req.params;
    const { code, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.passwordToken !== code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.passwordTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPass = await bcryptjs.hash(password, salt);
    user.password = hashedPass;
    user.passwordToken = null;
    user.passwordTokenExpiry = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password endpoint:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export default { signup, verifyUser, login, logout, me, resetPasswordLinkAndOtp,resetPass };
