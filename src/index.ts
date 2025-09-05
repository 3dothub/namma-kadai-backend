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

// Basic welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Namma Kadai API' });
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

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 30000, // 30 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 3,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      readPreference: 'primary'
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Wait for 5 seconds before retrying
    setTimeout(connectWithRetry, 5000);
  }
};

// Initial connection
connectWithRetry();

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected, attempting to reconnect...');
  connectWithRetry();
});

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(serverPort, "0.0.0.0", () => {
    console.log(`Server is running on port ${serverPort}`);
  });
}

// Export the app for Vercel
export default app;
