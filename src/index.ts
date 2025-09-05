import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Serve static files and handle root route
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

import routes from "./routes";

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Use all routes
app.use("/", routes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

const serverPort = typeof port === "string" ? parseInt(port) : port;

// Connect to MongoDB with serverless-friendly configuration
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 50, // Maintain up to 50 socket connections
      serverApi: { version: '1' as const },
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected successfully');
    
    // Add connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Add disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error: any) {
    console.error('MongoDB connection error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    if (process.env.NODE_ENV === 'production') {
      // In production, we want to know about connection failures immediately
      throw error;
    }
  }
};

// Connect to MongoDB
connectDB();

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(serverPort, "0.0.0.0", () => {
    console.log(`Server is running on port ${serverPort}`);
  });
}

// Export the app for Vercel
export default app;
