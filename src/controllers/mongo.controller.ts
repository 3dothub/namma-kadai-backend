import { Request, Response } from "express";
import mongoose from "mongoose";

async function connectToMongoDB() {
  try {
    // Close any existing connection first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Configure mongoose
    mongoose.set('strictQuery', true);
    
    // Connect with specific options
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      dbName: 'namma_kadai'
    });

    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
}

export const testMongoConnection = async (req: Request, res: Response) => {
  try {
    // Force a new connection attempt
    const connected = await connectToMongoDB();
    
    // Get current state after connection attempt
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    // Get connection information
    const connectionInfo = {
      state: stateMap[state as keyof typeof stateMap],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
      readyState: state,
      actuallyConnected: connected,
      mongodb_uri: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 
        'not set'
    };

    // Only proceed if we're actually connected
    if (connected && state === 1 && mongoose.connection.db) {
      try {
        // Try a simple ping operation with timeout
        await mongoose.connection.db.admin().ping();
        
        // If ping successful, get collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        return res.json({
          status: "success",
          connection: connectionInfo,
          collections: collections.map(col => col.name),
          ping: "successful"
        });
      } catch (dbError) {
        return res.status(500).json({
          status: "error",
          message: "Database operation failed",
          connection: connectionInfo,
          error: dbError instanceof Error ? dbError.message : "Unknown database error"
        });
      }
    }

    // If we reach here, we're not properly connected
    return res.status(500).json({
      status: "error",
      message: "Database not properly connected",
      connection: connectionInfo
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Connection test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
