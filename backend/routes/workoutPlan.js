import express from "express";

const router = express.Router();

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";

function bmi(weightKg, heightCm) {
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}

function bmiCategory(value) {
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Healthy range";
  if (value < 30) return "Overweight";
  return "Obesity range";
}

function localPlan({ age, weightKg, heightCm, goal, experience, daysPerWeek, focusAreas }) {
  const userBmi = bmi(weightKg, heightCm);
  const days = Math.min(Math.max(Number(daysPerWeek) || 4, 1), 7);
  const level = experience || "beginner";
  const goalText = goal || "general fitness";
  const reps = level === "beginner" ? "8-12" : "8-15";
  const sets = level === "beginner" ? 3 : 4;
  const focuses = Array.isArray(focusAreas) && focusAreas.length ? focusAreas : [];
  const split = [
    ["Upper body", ["Push-ups", "Dumbbell row", "Shoulder press"]],
    ["Lower body", ["Bodyweight squat", "Romanian deadlift", "Reverse lunge"]],
    ["Full body", ["Goblet squat", "Push-ups", "Plank"]],
    ["Back & core", ["Dumbbell row", "Lat pulldown", "Dead bug"]],
    ["Chest & arms", ["Bench press", "Incline push-up", "Biceps curl"]],
    ["Legs & glutes", ["Goblet squat", "Glute bridge", "Calf raise"]],
    ["Mobility & conditioning", ["Walking lunge", "Bird dog", "Farmer carry"]],
  ];

  return {
    summary: `This ${days}-day ${goalText} plan is tailored for a ${level} trainee. Start with controlled form and add weight or repetitions only when every set feels solid.`,
    bmi: userBmi,
    bmiCategory: bmiCategory(userBmi),
    weeklySchedule: Array.from({ length: days }, (_, index) => {
      const [defaultFocus, exercises] = split[index];
      const focus = focuses[index % focuses.length] || defaultFocus;
      return {
        day: `Day ${index + 1}`,
        focus,
        exercises: exercises.map((name) => ({
          name,
          sets,
          reps: name === "Plank" || name === "Dead bug" || name === "Bird dog" ? "30-45 sec" : reps,
          restSeconds: 60,
          notes: "Use a comfortable load and keep each repetition controlled.",
        })),
      };
    }),
    cardioRecommendation: "Add 20-30 minutes of easy-to-moderate cardio on 2-3 non-consecutive days each week.",
    nutritionTips: [
      "Include a protein source with each meal.",
      "Stay hydrated and prioritize minimally processed foods most of the time.",
      "Adjust portions gradually to support your stated goal.",
    ],
    cautions: [
      "Stop any movement that causes sharp pain.",
      "Consult a qualified clinician before starting if you have injuries or health concerns.",
    ],
  };
}

// POST /api/workout-plan
// body: { age, weightKg, heightCm, gender, goal, experience, daysPerWeek, focusAreas }
router.post("/", async (req, res) => {
  try {
    const {
      age,
      weightKg,
      heightCm,
      gender,
      goal,
      experience,
      daysPerWeek,
      focusAreas,
    } = req.body;

    if (!age || !weightKg || !heightCm || !gender) {
      return res.status(400).json({
        error: "age, weightKg, heightCm and gender are required.",
      });
    }

    const userBmi = bmi(weightKg, heightCm);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      console.warn("ANTHROPIC_API_KEY is not configured; generating a local workout plan.");
      return res.json(localPlan({
        age,
        weightKg,
        heightCm,
        goal,
        experience,
        daysPerWeek,
        focusAreas,
      }));
    }

    const systemPrompt = `You are a certified strength & conditioning coach creating personalized workout plans. Always reply with ONLY valid JSON, no markdown fences, no commentary, matching exactly this schema:
{
  "summary": string,               // 2-3 sentence overview of the plan and rationale
  "bmi": number,
  "bmiCategory": string,
  "weeklySchedule": [
    {
      "day": string,               // e.g. "Day 1"
      "focus": string,             // e.g. "Chest & Triceps"
      "exercises": [
        { "name": string, "sets": number, "reps": string, "restSeconds": number, "notes": string }
      ]
    }
  ],
  "cardioRecommendation": string,
  "nutritionTips": [string],
  "cautions": [string]
}
Keep the plan realistic for the person's stated experience level and goal. Use ${daysPerWeek || 4} training days in weeklySchedule. Prioritize the requested focus areas but keep the plan balanced.`;

    const userPrompt = `Create a personalized workout plan for:
- Age: ${age}
- Gender: ${gender}
- Weight: ${weightKg} kg
- Height: ${heightCm} cm
- Goal: ${goal || "general fitness"}
- Experience level: ${experience || "beginner"}
- Days per week available: ${daysPerWeek || 4}
- Preferred focus areas: ${
      Array.isArray(focusAreas) && focusAreas.length
        ? focusAreas.join(", ")
        : "full body"
    }`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Failed to generate plan from Claude API." });
    }

    const data = await response.json();
    const textBlock = data.content?.find((c) => c.type === "text");
    let planText = textBlock ? textBlock.text : "{}";
    planText = planText.trim().replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "");

    let plan;
    try {
      plan = JSON.parse(planText);
    } catch (e) {
      console.error("Failed to parse Claude response:", planText);
      return res.status(502).json({ error: "Received an unparsable plan from Claude." });
    }

    plan.bmi = plan.bmi || userBmi;

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error generating workout plan." });
  }
});

export default router;
