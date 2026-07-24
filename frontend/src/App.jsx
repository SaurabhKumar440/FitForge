import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ExerciseList from "./pages/ExerciseList.jsx";
import ExerciseDetail from "./pages/ExerciseDetail.jsx";
import WorkoutPlanForm from "./pages/WorkoutPlanForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exercises/:bodyPart" element={<ExerciseList />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/plan" element={<WorkoutPlanForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <footer
        style={{
          borderTop: "1px solid var(--steel)",
          padding: "24px",
          textAlign: "center",
          color: "var(--bone-dim)",
          fontSize: 13,
        }}
      >
        FitForge — built with React, Node & Claude
      </footer>
    </>
  );
}
