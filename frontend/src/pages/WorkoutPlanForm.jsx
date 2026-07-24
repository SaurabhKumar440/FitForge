import { useState } from "react";
import { api } from "../api.js";

const FOCUS_OPTIONS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio"];

const initialForm = {
  age: "",
  weightKg: "",
  heightCm: "",
  gender: "female",
  goal: "build muscle",
  experience: "beginner",
  daysPerWeek: 4,
  focusAreas: [],
};

export default function WorkoutPlanForm() {
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFocus(area) {
    setForm((f) => ({
      ...f,
      focusAreas: f.focusAreas.includes(area)
        ? f.focusAreas.filter((a) => a !== area)
        : [...f.focusAreas, area],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await api.generateWorkoutPlan({
        ...form,
        age: Number(form.age),
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        daysPerWeek: Number(form.daysPerWeek),
      });
      setPlan(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: "40px 24px 100px" }}>
      <div className="eyebrow">Personalized</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, margin: "8px 0 8px" }}>
        Build my plan
      </h1>
      <p style={{ color: "var(--bone-dim)", marginBottom: 32, maxWidth: 560 }}>
        Tell us about yourself and Claude will draft a weekly training split tuned to your
        goal, experience, and schedule.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: plan ? "0.85fr 1.15fr" : "1fr", gap: 40 }}>
        <form onSubmit={submit} className="card" style={{ padding: 28 }}>
          <FieldRow>
            <Field label="Age">
              <input
                type="number"
                required
                min="13"
                max="90"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)} style={inputStyle}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Weight (kg)">
              <input
                type="number"
                required
                min="30"
                max="250"
                value={form.weightKg}
                onChange={(e) => update("weightKg", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                required
                min="120"
                max="230"
                value={form.heightCm}
                onChange={(e) => update("heightCm", e.target.value)}
                style={inputStyle}
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Goal">
              <select value={form.goal} onChange={(e) => update("goal", e.target.value)} style={inputStyle}>
                <option>build muscle</option>
                <option>lose fat</option>
                <option>general fitness</option>
                <option>improve endurance</option>
                <option>increase strength</option>
              </select>
            </Field>
            <Field label="Experience">
              <select
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
                style={inputStyle}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
          </FieldRow>

          <Field label={`Training days per week: ${form.daysPerWeek}`}>
            <input
              type="range"
              min="2"
              max="6"
              value={form.daysPerWeek}
              onChange={(e) => update("daysPerWeek", e.target.value)}
              style={{ width: "100%" }}
            />
          </Field>

          <Field label="Focus areas (optional)">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {FOCUS_OPTIONS.map((area) => (
                <button
                  type="button"
                  key={area}
                  onClick={() => toggleFocus(area)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    border: "1px solid var(--steel)",
                    background: form.focusAreas.includes(area) ? "var(--molten)" : "transparent",
                    color: form.focusAreas.includes(area) ? "var(--forge-black)" : "var(--bone-dim)",
                    fontWeight: 600,
                  }}
                >
                  {area}
                </button>
              ))}
            </div>
          </Field>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 22 }}>
            {loading ? "Generating with Claude…" : "Generate my plan"}
          </button>

          {error && (
            <p style={{ color: "var(--molten)", fontSize: 13, marginTop: 14, lineHeight: 1.6 }}>
              {error}
            </p>
          )}
        </form>

        {plan && <PlanResult plan={plan} />}
      </div>
    </div>
  );
}

function PlanResult({ plan }) {
  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div className="eyebrow">Your plan</div>
        <p style={{ marginTop: 10, lineHeight: 1.7, color: "var(--bone)" }}>{plan.summary}</p>
        <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
          <Stat label="BMI" value={plan.bmi} />
          <Stat label="Category" value={plan.bmiCategory} />
        </div>
      </div>

      {plan.weeklySchedule?.map((day, i) => (
        <div key={i} className="card" style={{ padding: 22, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{day.day}</h3>
            <span style={{ color: "var(--molten)", fontSize: 13, fontWeight: 700 }}>{day.focus}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "var(--bone-dim)", textAlign: "left" }}>
                <th style={thStyle}>Exercise</th>
                <th style={thStyle}>Sets</th>
                <th style={thStyle}>Reps</th>
                <th style={thStyle}>Rest</th>
              </tr>
            </thead>
            <tbody>
              {day.exercises?.map((ex, j) => (
                <tr key={j} style={{ borderTop: "1px solid var(--steel)" }}>
                  <td style={tdStyle}>{ex.name}</td>
                  <td style={tdStyle}>{ex.sets}</td>
                  <td style={tdStyle}>{ex.reps}</td>
                  <td style={{ ...tdStyle, fontFamily: "var(--font-mono)" }}>{ex.restSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {plan.cardioRecommendation && (
        <InfoCard title="Cardio" text={plan.cardioRecommendation} />
      )}
      {plan.nutritionTips?.length > 0 && (
        <InfoCard title="Nutrition tips" list={plan.nutritionTips} />
      )}
      {plan.cautions?.length > 0 && <InfoCard title="Cautions" list={plan.cautions} accent="var(--ember)" />}
    </div>
  );
}

function InfoCard({ title, text, list, accent = "var(--molten)" }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
      <h4 style={{ color: accent, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        {title}
      </h4>
      {text && <p style={{ lineHeight: 1.6, fontSize: 14 }}>{text}</p>}
      {list && (
        <ul style={{ paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--bone-dim)" }}>{label}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: "var(--bone-dim)", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </label>
  );
}

function FieldRow({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--iron-2)",
  border: "1px solid var(--steel)",
  borderRadius: 6,
  color: "var(--bone)",
  fontSize: 14,
};

const thStyle = { padding: "6px 8px", fontWeight: 600 };
const tdStyle = { padding: "8px 8px" };
