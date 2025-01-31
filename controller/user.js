import User from "../model/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authentication = async (req, res) => {
  try {
    console.log(req.body);

    // Validate request body
    if (!req.body.email || !req.body.name) {
      return res.status(400).json({ message: "Email and Name are required." });
    }

    // Find the user by email
    const findUser = await User.findOne({ email: req.body.email });

    if (findUser) {
      // Generate JWT token
      const token = jwt.sign({ userId: findUser._id }, process.env.SECRET_KEY, { expiresIn: "2d" });

      // Set token as a cookie
      res.cookie("token", token, {
        httpOnly: false, // Prevent JavaScript access
        sameSite: "Lax",
        secure: true, // Secure flag in production
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      });

      return res.status(200).json({ message: "User logged in successfully", data: findUser });
    } else {
      // Register new user
      const user = new User(req.body);
      await user.save();

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "2d" });

      // Set token as a cookie
      res.cookie("token", token, {
        httpOnly: false,
        sameSite: "Lax",
        secure: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ message: "User registered successfully", data: user });
    }
  } catch (error) {
    console.error("Error during authentication:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};
