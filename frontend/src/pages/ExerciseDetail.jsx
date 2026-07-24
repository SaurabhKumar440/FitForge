import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import Timer from "../components/Timer.jsx";

export default function ExerciseDetail() {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [logged, setLogged] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    api.getExerciseDetail(id).then(setExercise).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!exercise || !playing) return;
    intervalRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % exercise.images.length);
    }, 900);
    return () => clearInterval(intervalRef.current);
  }, [exercise, playing]);

  async function logCompletion(durationSeconds) {
    try {
      await api.addLog({
        exerciseName: exercise.name,
        bodyPart: exercise.bodyPart,
        durationSeconds,
      });
      setLogged(true);
      setTimeout(() => setLogged(false), 2500);
    } catch {
      /* silent — logging is a nice-to-have */
    }
  }

  if (error) {
    return (
      <div className="container" style={{ padding: 40 }}>
        <p style={{ color: "var(--molten)" }}>{error}</p>
        <Link to="/">← Back home</Link>
      </div>
    );
  }
  if (!exercise) {
    return (
      <div className="container" style={{ padding: 40, color: "var(--bone-dim)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <Link to={`/exercises/${exercise.bodyPart}`} style={{ color: "var(--bone-dim)", fontSize: 14 }}>
        ← Back to {exercise.bodyPart}
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 36, marginTop: 20 }}>
        <div>
          <div
            className="card"
            style={{ overflow: "hidden", position: "relative", aspectRatio: "4/3" }}
          >
            {exercise.images.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt={`${exercise.name} form step ${i + 1}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: frame === i ? 1 : 0,
                  transition: "opacity 0.35s ease",
                }}
              />
            ))}
            <button
              onClick={() => setPlaying((p) => !p)}
              className="btn"
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "rgba(14,15,17,0.75)",
                color: "var(--bone)",
                border: "1px solid var(--steel)",
                padding: "6px 14px",
                fontSize: 12,
              }}
            >
              {playing ? "⏸ Pause loop" : "▶ Play loop"}
            </button>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, margin: "22px 0 10px" }}>
            {exercise.name}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <Tag>{exercise.level}</Tag>
            <Tag>{exercise.equipment}</Tag>
            <Tag>target: {exercise.targetMuscle}</Tag>
            {exercise.secondaryMuscles?.map((m) => (
              <Tag key={m}>+{m}</Tag>
            ))}
          </div>

          <h3 style={{ fontSize: 15, color: "var(--ember)", marginBottom: 10 }}>How to perform</h3>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, color: "var(--bone)" }}>
            {exercise.instructions.map((step, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {step}
              </li>
            ))}
          </ol>

          <button
            className="btn btn-primary"
            style={{ marginTop: 10 }}
            onClick={() => logCompletion(0)}
          >
            {logged ? "✓ Logged to dashboard" : "Mark set complete"}
          </button>
        </div>

        <div style={{ position: "sticky", top: 88, alignSelf: "start" }}>
          <Timer onComplete={() => logCompletion(0)} />
          <p style={{ fontSize: 13, color: "var(--bone-dim)", marginTop: 12, lineHeight: 1.6 }}>
            Use <strong style={{ color: "var(--bone)" }}>Stopwatch</strong> to time your set, or{" "}
            <strong style={{ color: "var(--bone)" }}>Rest Countdown</strong> between sets. A chime
            plays when the rest timer hits zero.
          </p>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 4,
        background: "var(--iron-2)",
        border: "1px solid var(--steel)",
        color: "var(--bone-dim)",
        textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}
