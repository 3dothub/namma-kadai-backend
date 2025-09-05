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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: Implement email sending logic here
    // For now, we'll just return a success message
    res.json({ 
      message: "You will receive password reset instructions." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      message: "Could not process password reset request. Please try again." 
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Please provide both email and verification code" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: Implement OTP verification logic here
    // For now, we'll just return a success message
    res.json({ 
      message: "Email verified successfully" 
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ 
      message: "Could not verify email. Please try again." 
    });
  }
};

export const authenticateToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-key123", async (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        valid: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ 
      message: "Could not verify token. Please try again." 
    });
  }
};
