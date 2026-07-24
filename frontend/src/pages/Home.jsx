import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BodySilhouette from "../components/BodySilhouette.jsx";

const PARTS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio"];

export default function Home() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  function select(part) {
    setActive(part);
    setTimeout(() => navigate(`/exercises/${part}`), 180);
  }

  return (
    <div className="container" style={{ padding: "56px 24px 80px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <div className="eyebrow">Pick your target</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(34px, 5vw, 56px)",
              lineHeight: 1.02,
              margin: "10px 0 18px",
            }}
          >
            Train what
            <br />
            matters today.
          </h1>
          <p style={{ color: "var(--bone-dim)", fontSize: 16, lineHeight: 1.6, maxWidth: 440 }}>
            Tap a region on the figure — or pick from the list — to pull up exercises,
            form instructions, and a built-in timer. No account, no clutter.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
            {PARTS.map((p) => (
              <button
                key={p}
                onClick={() => select(p)}
                className="btn"
                style={{
                  padding: "10px 18px",
                  fontSize: 14,
                  border: "1px solid var(--steel)",
                  background: active === p ? "var(--molten)" : "var(--iron)",
                  color: active === p ? "var(--forge-black)" : "var(--bone)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <BodySilhouette active={active} onSelect={select} />
        </div>
      </div>
    </div>
  );
}
