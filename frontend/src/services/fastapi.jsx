const API_BASE = "http://127.0.0.1:8000";

export async function fetchFunctions() {
  const res = await fetch(`${API_BASE}/api/functions`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend-Fehler: ${res.status} ${res.statusText}\n${text}`);
  }
  return await res.json();
}

export async function postForNewtonIteration(payload) {
  const res = await fetch(`${API_BASE}/api/newton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Body immer lesen, auch bei Fehlern
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    console.error("FastAPI error response:", body);
    throw new Error(
      `POST fehlgeschlagen: ${res.status}\n${
        typeof body === "string" ? body : JSON.stringify(body, null, 2)
      }`,
    );
  }

  return body;
}
