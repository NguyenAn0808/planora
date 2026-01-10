import express from "express";
import { connectDB } from "./config/db.js";
import morgan from "morgan";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";
import commentRoute from "./routes/commentRoute.js";
import issueRoute from "./routes/issueRoute.js";
import sprintRoute from "./routes/sprintRoute.js";
import favoriteProjectRoute from "./routes/favoriteProjectRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "healthy" : "unhealthy";

  const status = {
    server: "up",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  };

  if (dbStatus === "healthy") {
    res.status(200).json(status);
  } else {
    res.status(503).json(status);
  }
});

// public routes
app.use("/api/auth", authRoute);
app.use(protectedRoute);

// private routes
app.use("/api/users", userRoute);

// Project routes
app.use("/api/projects", projectRoute);

// Task routes
app.use("/api/issues", issueRoute);

// Sprint routes
app.use("/api/sprints", sprintRoute);

// Comment routes
app.use("/api/comments", commentRoute);

// Favorite project routes
app.use("/api/favorites", favoriteProjectRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server start with port ${PORT}`);
  });
});
