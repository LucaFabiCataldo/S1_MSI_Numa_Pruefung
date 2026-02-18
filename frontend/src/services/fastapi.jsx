const API_BASE = "http://127.0.0.1:8000";

export async function fetchFunctions() {
  const res = await fetch(`${API_BASE}/api/functions`);
  if (!res.ok) {
    throw new Error(`Backend-Fehler: ${res.status} ${res.statusText}`);
  }
  return await res.json(); // erwartet: [ [f, df], ... ]
}

export async function postForNewtonIteration(payload) {
    console.log("POST");
    const res = await fetch("http://127.0.0.1:8000/api/newton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`POST fehlgeschlagen: ${res.status}`);
    return await res.json(); // <- DAS ist dein Array/Objekt
}

