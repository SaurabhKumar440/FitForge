import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

export default function ExerciseList() {
  const { bodyPart } = useParams();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getExercisesByBodyPart(bodyPart)
      .then(setExercises)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bodyPart]);

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <Link to="/" style={{ color: "var(--bone-dim)", fontSize: 14 }}>
        ← Change body part
      </Link>
      <div className="eyebrow" style={{ marginTop: 16 }}>
        {exercises.length} exercises
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, margin: "8px 0 28px" }}>
        {bodyPart}
      </h1>

      {loading && <p style={{ color: "var(--bone-dim)" }}>Loading exercises…</p>}
      {error && <p style={{ color: "var(--molten)" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {exercises.map((ex) => (
          <Link
            key={ex.id}
            to={`/exercise/${ex.id}`}
            className="card"
            style={{ overflow: "hidden", display: "block" }}
          >
            <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "var(--iron-2)" }}>
              <img
                src={ex.images[0]}
                alt={ex.name}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag>{ex.level}</Tag>
                <Tag>{ex.equipment}</Tag>
              </div>
            </div>
          </Link>
        ))}
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
