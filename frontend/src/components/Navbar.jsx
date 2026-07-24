import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Train", end: true },
  { to: "/plan", label: "Plan" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--steel)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(14,15,17,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M4 13h4M18 13h4M8 8v10M18 8v10M8 13h10"
              stroke="var(--molten)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "-0.02em" }}>
            FIT<span style={{ color: "var(--molten)" }}>FORGE</span>
          </span>
        </NavLink>

        <nav style={{ display: "flex", gap: 4 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "var(--forge-black)" : "var(--bone-dim)",
                background: isActive ? "var(--molten)" : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
