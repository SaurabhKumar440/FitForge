import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  function refresh() {
    Promise.all([api.getStats(), api.getLogs()])
      .then(([s, l]) => {
        setStats(s);
        setLogs(l.slice().reverse());
      })
      .catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function removeLog(id) {
    await api.deleteLog(id);
    refresh();
  }

  if (error) return <div className="container" style={{ padding: 40, color: "var(--molten)" }}>{error}</div>;
  if (!stats) return <div className="container" style={{ padding: 40, color: "var(--bone-dim)" }}>Loading…</div>;

  const maxCount = Math.max(1, ...stats.last7Days.map((d) => d.count));

  return (
    <div className="container" style={{ padding: "40px 24px 100px" }}>
      <div className="eyebrow">Your progress</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, margin: "8px 0 32px" }}>
        Dashboard
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        <StatCard label="Sessions logged" value={stats.totalSessions} />
        <StatCard label="Total minutes" value={stats.totalMinutes} />
        <StatCard label="Current streak" value={`${stats.streak}d`} />
        <StatCard label="Body parts trained" value={Object.keys(stats.byBodyPart).length} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 14, color: "var(--bone-dim)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Last 7 days
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
            {stats.last7Days.map((d) => (
              <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    height: `${(d.count / maxCount) * 90 + (d.count > 0 ? 10 : 2)}px`,
                    background: d.count > 0 ? "var(--molten)" : "var(--steel)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
                <div style={{ fontSize: 10, color: "var(--bone-dim)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {d.date.slice(5)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 14, color: "var(--bone-dim)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            By body part
          </h3>
          {Object.keys(stats.byBodyPart).length === 0 ? (
            <p style={{ color: "var(--bone-dim)", fontSize: 13 }}>No sessions logged yet.</p>
          ) : (
            Object.entries(stats.byBodyPart).map(([bp, count]) => (
              <div key={bp} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{bp}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--bone-dim)" }}>{count}</span>
                </div>
                <div style={{ height: 6, background: "var(--steel)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${(count / stats.totalSessions) * 100}%`,
                      height: "100%",
                      background: "var(--ember)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <h3 style={{ fontSize: 14, color: "var(--bone-dim)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Recent activity
      </h3>
      {logs.length === 0 ? (
        <p style={{ color: "var(--bone-dim)", fontSize: 14 }}>
          Nothing logged yet — complete an exercise and mark it done to see it here.
        </p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {logs.map((log, i) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderTop: i === 0 ? "none" : "1px solid var(--steel)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{log.exerciseName}</div>
                <div style={{ fontSize: 12, color: "var(--bone-dim)" }}>
                  {log.bodyPart} · {new Date(log.date).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => removeLog(log.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--bone-dim)",
                  fontSize: 13,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--molten)" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--bone-dim)", marginTop: 4 }}>{label}</div>
    </div>
  );
}
