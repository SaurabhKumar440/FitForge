import { useEffect, useRef, useState } from "react";

function format(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// mode: "stopwatch" counts up. countdownSeconds > 0 makes it a countdown that beeps at 0.
export default function Timer({ onComplete }) {
  const [mode, setMode] = useState("stopwatch"); // "stopwatch" | "countdown"
  const [countdownInput, setCountdownInput] = useState(60);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "countdown") {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              setRunning(false);
              beep();
              onComplete && onComplete();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  function beep() {
    try {
      const ctx =
        audioCtxRef.current ||
        (audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      /* audio not available, ignore */
    }
  }

  function start() {
    if (mode === "countdown" && seconds === 0) setSeconds(Number(countdownInput));
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setSeconds(mode === "countdown" ? Number(countdownInput) : 0);
  }
  function switchMode(next) {
    setRunning(false);
    setMode(next);
    setSeconds(next === "countdown" ? Number(countdownInput) : 0);
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button
          className="btn"
          onClick={() => switchMode("stopwatch")}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 13,
            background: mode === "stopwatch" ? "var(--steel-soft)" : "transparent",
            border: "1px solid var(--steel)",
            color: "var(--bone)",
          }}
        >
          Stopwatch
        </button>
        <button
          className="btn"
          onClick={() => switchMode("countdown")}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 13,
            background: mode === "countdown" ? "var(--steel-soft)" : "transparent",
            border: "1px solid var(--steel)",
            color: "var(--bone)",
          }}
        >
          Rest Countdown
        </button>
      </div>

      {mode === "countdown" && !running && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          <label style={{ fontSize: 13, color: "var(--bone-dim)" }}>Seconds:</label>
          <input
            type="number"
            min="5"
            step="5"
            value={countdownInput}
            onChange={(e) => {
              setCountdownInput(e.target.value);
              setSeconds(Number(e.target.value));
            }}
            style={{
              width: 80,
              padding: "6px 10px",
              background: var_input_bg(),
              border: "1px solid var(--steel)",
              borderRadius: 4,
              color: "var(--bone)",
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>
      )}

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 64,
          fontWeight: 700,
          textAlign: "center",
          color: running ? "var(--molten)" : "var(--bone)",
          letterSpacing: "0.02em",
          margin: "8px 0 20px",
        }}
      >
        {format(seconds)}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {!running ? (
          <button className="btn btn-primary" onClick={start}>
            {seconds > 0 && mode === "stopwatch" ? "Resume" : "Start"}
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={pause}>
            Pause
          </button>
        )}
        <button className="btn btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}

function var_input_bg() {
  return "var(--iron-2)";
}
