import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import exercisesRouter from "./routes/exercises.js";
import workoutPlanRouter from "./routes/workoutPlan.js";
import dashboardRouter from "./routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FitForge API" });
});

app.use("/api/exercises", exercisesRouter);
app.use("/api/workout-plan", workoutPlanRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`FitForge API running on http://localhost:${PORT}`);
});
