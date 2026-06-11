import dotenv from "dotenv";
import express from 'express';
import { connectDB, disconnectDB } from './config/db.js';

import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";

dotenv.config();
connectDB();


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/movies', movieRoutes);
app.use('/auth', authRoutes);
app.use('/watchlist', watchlistRoutes);

const server = app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});

// handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection", error);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  console.error("Uncaught exception", error);
  await disconnectDB();
  process.exit(1);
});

// graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    console.log("Server closed, exiting process");
    process.exit(0);
  });
});