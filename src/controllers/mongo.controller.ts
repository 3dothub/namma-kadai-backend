import { Request, Response } from "express";
import mongoose from "mongoose";

export const testMongoConnection = async (req: Request, res: Response) => {
  try {
    // Check the current connection state
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
      mongodb_uri: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 
        'not set'
    };

    // Try to connect if not connected
    if (state !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI!, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000
        });
        connectionInfo.state = "connected";
      } catch (connError) {
        return res.status(500).json({
          status: "error",
          message: "Failed to connect to database",
          connection: connectionInfo,
          error: connError instanceof Error ? connError.message : "Unknown connection error"
        });
      }
    }

    if (mongoose.connection.db) {
      // If connected, try a simple operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = await mongoose.connection.db.stats();
      
      return res.json({
        status: "success",
        connection: connectionInfo,
        collections: collections.map(col => col.name),
        stats: {
          collections: stats.collections,
          indexes: stats.indexes,
          objects: stats.objects
        }
      });
    }

    res.status(500).json({
      status: "error",
      message: "Database not connected",
      connection: connectionInfo
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      connection: {
        state: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
};
