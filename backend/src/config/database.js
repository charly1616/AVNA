import mongoose from "mongoose";
import { ENV } from "../config/env.js";

/**
 * Opens the single shared Mongoose connection for the whole process.
 * Mongoose buffers commands while disconnected, so this is called once
 * at boot from server.js and every model reuses it.
 */
export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(ENV.mongodbUri, {
    dbName: ENV.mongodbDbName,
    serverSelectionTimeoutMS: 10_000,
  });

  console.log(`[db] connected to "${connection.connection.name}" at ${connection.connection.host}`);

  return connection;
};

export const disconnectDatabase = () => mongoose.connection.close();