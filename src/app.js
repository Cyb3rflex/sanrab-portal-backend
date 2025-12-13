import express from "express";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import resultsRoutes from "./routes/results.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/results", resultsRoutes);

// Global error handler
app.use(errorHandler);

export default app;
