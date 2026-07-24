import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsPath = path.join(__dirname, "..", "data", "logs.json");

const router = express.Router();

function loadLogs() {
  try {
    return JSON.parse(fs.readFileSync(logsPath, "utf-8"));
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

// GET /api/dashboard/logs
router.get("/logs", (req, res) => {
  res.json(loadLogs());
});

// POST /api/dashboard/logs - log a completed exercise/session
// body: { exerciseName, bodyPart, durationSeconds, sets, reps, date }
router.post("/logs", (req, res) => {
  const { exerciseName, bodyPart, durationSeconds, sets, reps } = req.body;
  if (!exerciseName || !bodyPart) {
    return res.status(400).json({ error: "exerciseName and bodyPart are required." });
  }
  const logs = loadLogs();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    exerciseName,
    bodyPart,
    durationSeconds: durationSeconds || 0,
    sets: sets || null,
    reps: reps || null,
    date: new Date().toISOString(),
  };
  logs.push(entry);
  saveLogs(logs);
  res.status(201).json(entry);
});

// DELETE /api/dashboard/logs/:id
router.delete("/logs/:id", (req, res) => {
  const logs = loadLogs();
  const filtered = logs.filter((l) => l.id !== req.params.id);
  saveLogs(filtered);
  res.json({ success: true });
});

// GET /api/dashboard/stats - aggregate stats for dashboard
router.get("/stats", (req, res) => {
  const logs = loadLogs();
  const totalSessions = logs.length;
  const totalMinutes = Math.round(
    logs.reduce((sum, l) => sum + (l.durationSeconds || 0), 0) / 60
  );

  const byBodyPart = {};
  logs.forEach((l) => {
    byBodyPart[l.bodyPart] = (byBodyPart[l.bodyPart] || 0) + 1;
  });

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    const count = logs.filter((l) => l.date.slice(0, 10) === dayStr).length;
    return { date: dayStr, count };
  });

  const streak = (() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const hasLog = logs.some((l) => l.date.slice(0, 10) === dayStr);
      if (hasLog) s++;
      else if (i > 0) break;
      else break;
    }
    return s;
  })();

  res.json({ totalSessions, totalMinutes, byBodyPart, last7Days, streak });
});

export default router;
