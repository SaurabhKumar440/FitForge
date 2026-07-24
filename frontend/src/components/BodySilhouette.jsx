// Simplified front-facing anatomical map. Each region is a shape group.
export default function BodySilhouette({ active, onSelect }) {
  const isOn = (part) => active === part;

  const fill = (part) => (isOn(part) ? "var(--molten)" : "var(--steel-soft)");
  const stroke = (part) => (isOn(part) ? "var(--ember)" : "transparent");

  const regionProps = (part) => ({
    fill: fill(part),
    stroke: stroke(part),
    strokeWidth: 2,
    style: { cursor: "pointer", transition: "fill 0.15s ease" },
    onClick: () => onSelect(part),
    onMouseEnter: (e) => {
      if (!isOn(part)) e.currentTarget.setAttribute("fill", "#4a4e54");
    },
    onMouseLeave: (e) => {
      if (!isOn(part)) e.currentTarget.setAttribute("fill", fill(part));
    },
    role: "button",
    tabIndex: 0,
    "aria-label": `Select ${part}`,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") onSelect(part);
    },
  });

  return (
    <svg viewBox="0 0 200 340" width="220" height="374" aria-label="Body part selector">
      {/* Head */}
      <ellipse cx="100" cy="26" rx="18" ry="20" fill="var(--steel)" />

      {/* Neck */}
      <rect x="91" y="42" width="18" height="14" fill="var(--steel)" />

      {/* Shoulders */}
      <ellipse cx="62" cy="66" {...regionProps("Shoulders")} rx="20" ry="14" />
      <ellipse cx="138" cy="66" {...regionProps("Shoulders")} rx="20" ry="14" />

      {/* Chest */}
      <rect x="72" y="58" width="56" height="46" rx="10" {...regionProps("Chest")} />

      {/* Core / abs */}
      <rect x="76" y="106" width="48" height="52" rx="8" {...regionProps("Core")} />

      {/* Arms (upper + forearm combined) */}
      <rect x="34" y="70" width="20" height="90" rx="10" {...regionProps("Arms")} />
      <rect x="146" y="70" width="20" height="90" rx="10" {...regionProps("Arms")} />

      {/* Back label zone (represented as side strip near shoulders/lats, front-safe visual cue) */}
      <rect x="18" y="86" width="10" height="50" rx="5" {...regionProps("Back")} />
      <rect x="172" y="86" width="10" height="50" rx="5" {...regionProps("Back")} />

      {/* Legs */}
      <rect x="76" y="160" width="20" height="110" rx="10" {...regionProps("Legs")} />
      <rect x="104" y="160" width="20" height="110" rx="10" {...regionProps("Legs")} />

      {/* Feet */}
      <ellipse cx="86" cy="278" rx="12" ry="7" fill="var(--steel)" />
      <ellipse cx="114" cy="278" rx="12" ry="7" fill="var(--steel)" />

      {/* Cardio - heart icon floating to the side, always distinct */}
      <g
        transform="translate(96, 300)"
        {...regionProps("Cardio")}
        aria-label="Select Cardio"
      >
        <path
          d="M8,20 C-6,10 -6,-4 4,-4 C8,-4 8,0 8,0 C8,0 8,-4 12,-4 C22,-4 22,10 8,20 Z"
          fill={fill("Cardio")}
          stroke={stroke("Cardio")}
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
