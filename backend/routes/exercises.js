import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "exercises.json");

const router = express.Router();

function loadExercises() {
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

// GET /api/exercises/bodyparts - list of available body parts with counts
router.get("/bodyparts", (req, res) => {
  const data = loadExercises();
  const bodyParts = Object.keys(data).map((bp) => ({
    name: bp,
    count: data[bp].length,
  }));
  res.json(bodyParts);
});

// GET /api/exercises/:bodyPart - all exercises for a body part
router.get("/:bodyPart", (req, res) => {
  const data = loadExercises();
  const bp = req.params.bodyPart;
  const match = Object.keys(data).find(
    (k) => k.toLowerCase() === bp.toLowerCase()
  );
  if (!match) {
    return res.status(404).json({ error: `No exercises found for '${bp}'` });
  }
  res.json(data[match]);
});

// GET /api/exercises/detail/:id - single exercise by id
router.get("/detail/:id", (req, res) => {
  const data = loadExercises();
  for (const bp of Object.keys(data)) {
    const ex = data[bp].find((e) => e.id === req.params.id);
    if (ex) return res.json(ex);
  }
  res.status(404).json({ error: "Exercise not found" });
});

export default router;
