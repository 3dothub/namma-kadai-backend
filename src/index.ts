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
app.use(express.static(path.join(__dirname, '../')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
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
mongoose.connect(process.env.MONGODB_URI!, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 50, // Maintain up to 50 socket connections
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  // Exit process with failure if connection is required
  if (process.env.NODE_ENV === 'production') {
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
