const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getBodyParts: () => fetch(`${BASE}/exercises/bodyparts`).then(handle),
  getExercisesByBodyPart: (bodyPart) =>
    fetch(`${BASE}/exercises/${encodeURIComponent(bodyPart)}`).then(handle),
  getExerciseDetail: (id) =>
    fetch(`${BASE}/exercises/detail/${encodeURIComponent(id)}`).then(handle),

  generateWorkoutPlan: (payload) =>
    fetch(`${BASE}/workout-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  getLogs: () => fetch(`${BASE}/dashboard/logs`).then(handle),
  addLog: (payload) =>
    fetch(`${BASE}/dashboard/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),
  deleteLog: (id) =>
    fetch(`${BASE}/dashboard/logs/${id}`, { method: "DELETE" }).then(handle),
  getStats: () => fetch(`${BASE}/dashboard/stats`).then(handle),
};
