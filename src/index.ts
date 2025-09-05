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

// Connect to MongoDB with proper configurations
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');

mongoose.connect(process.env.MONGODB_URI!, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('Successfully connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  if (process.env.NODE_ENV === 'production') {
    console.error('Fatal: Could not connect to MongoDB in production');
    process.exit(1);
  }
});

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(serverPort, "0.0.0.0", () => {
    console.log(`Server is running on port ${serverPort}`);
  });
}

// Export the app for Vercel
export default app;
