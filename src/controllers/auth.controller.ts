import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("Register route hit with body:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists:", existingUser._id);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-super-secret-key123",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Account created successfully! Welcome!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Request body:", req.body);
    res.status(500).json({
      message: "Registration failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log("Login attempt received:", {
      body: req.body,
      headers: req.headers,
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing credentials");
      return res.status(400).json({ message: "Please enter email and password" });
    }

    console.log("Looking up user with email:", email);
    const user = await User.findOne({ email });
    
    console.log("User found:", user ? "Yes" : "No");
    console.log("User object:", user);

    if (!user) {
      console.log("User not found, returning 401");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Comparing password...");
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-super-secret-key123",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful! Welcome back!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};
