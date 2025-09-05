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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!);

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(serverPort, "0.0.0.0", () => {
    console.log(`Server is running on port ${serverPort}`);
  });
}

// Export the app for Vercel
export default app;
