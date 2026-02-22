import { useMemo } from "react";

export default function DrawNewton({
  f,
  f_,
  width,
  height,
  iterations = [],
  // FIX: brauchbare Default-Domain (dein altes domain={xMin,xMax,...} ist kaputt, weil xMin etc. da noch nicht existieren)
  domain = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  startValue,
  samples = 500,
  showAxes = true,
  children,
}) {
  const { xMin, xMax, yMin, yMax } = domain;

  // Pixel-Mapping
  const { X, Y, sx } = useMemo(() => {
    const sx = width / (xMax - xMin);
    const sy = height / (yMax - yMin);

    return {
      sx,
      X: (x) => (x - xMin) * sx,
      Y: (y) => height - (y - yMin) * sy, // SVG y-Achse invertiert
    };
  }, [width, height, xMin, xMax, yMin, yMax]);

  // Graph als PATH mit Unterbrechungen (keine doofen Striche über Polstellen/Lücken)
  const pathData = useMemo(() => {
    let d = "";
    let drawing = false;

    const yRange = yMax - yMin;
    const paddingFactor = 0.2; // 20% padding außerhalb des sichtbaren y-Bereichs
    const yMinPad = yMin - yRange * paddingFactor;
    const yMaxPad = yMax + yRange * paddingFactor;

    // Lücke um x=0 (passt sich an Sampling an) – verhindert Strich über 1/x etc.
    const epsilon = (xMax - xMin) / samples / 2;

    for (let i = 0; i <= samples; i++) {
      const x = xMin + (i / samples) * (xMax - xMin);

      // Definitionslücke bei x≈0: Segment abbrechen
      if (Math.abs(x) < epsilon) {
        drawing = false;
        continue;
      }

      const y = f(x);

      const valid = Number.isFinite(y) && y >= yMinPad && y <= yMaxPad;

      if (!valid) {
        drawing = false; // <- wichtig: unterbricht, statt zu verbinden
        continue;
      }

      const px = X(x);
      const py = Y(y);

      if (!Number.isFinite(px) || !Number.isFinite(py)) {
        drawing = false;
        continue;
      }

      if (!drawing) {
        d += `M ${px} ${py} `;
        drawing = true;
      } else {
        d += `L ${px} ${py} `;
      }
    }

    return d;
  }, [f, samples, xMin, xMax, yMin, yMax, X, Y]);

  // Achsen
  const xAxisY = Y(0);
  const yAxisX = X(0);

  // Tangente stabil: feste Pixel-Länge statt ±40 in Funktionskoordinaten
  const gradient = f_(startValue);
  const tangentPixelLength = 160000; // px
  const dx = tangentPixelLength / sx;

  // Hilfsfunktion: check ob Linienpunkt in Ordnung ist
  const finite = (...vals) => vals.every(Number.isFinite);

  return (
    <svg width={width} height={height}>
      {showAxes && (
        <>
          {/* Achsenlinien */}
          <line x1={0} y1={xAxisY} x2={width} y2={xAxisY} stroke="#9ca1a3" />
          <line x1={yAxisX} y1={0} x2={yAxisX} y2={height} stroke="#9ca1a3" />

          {/* X-Achsen-Ticks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const value = xMin + (i / 10) * (xMax - xMin);
            const x = X(value);
            return (
              <g key={`x-${i}`}>
                <line
                  x1={x}
                  y1={xAxisY - 5}
                  x2={x}
                  y2={xAxisY + 5}
                  stroke="white"
                />
                <text
                  x={x}
                  y={xAxisY + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                >
                  {value.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Y-Achsen-Ticks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const value = yMin + (i / 10) * (yMax - yMin);
            const y = Y(value);
            return (
              <g key={`y-${i}`}>
                <line
                  x1={yAxisX - 5}
                  y1={y}
                  x2={yAxisX + 5}
                  y2={y}
                  stroke="white"
                />
                <text
                  x={yAxisX - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="white"
                >
                  {value.toFixed(2)}
                </text>
              </g>
            );
          })}
        </>
      )}

      {/* Graph einzeichnen (WICHTIG: path statt polyline) */}
      <path d={pathData} fill="none" stroke="#57cdA5" strokeWidth="2" />

      {/* Tangente einzeichnen (nur wenn Werte endlich sind) */}
      {(() => {
        const y0 = f(startValue);
        const x1 = startValue - dx;
        const x2 = startValue + dx;
        const y1 = y0 - dx * gradient;
        const y2 = y0 + dx * gradient;

        if (!finite(x1, x2, y0, y1, y2, gradient)) return null;

        return (
          <line x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} stroke="#63a8ce" />
        );
      })()}

      {/* Newton-Schritte zeichnen (nur wenn endlich) */}
      {iterations.map((it, i) => {
        const [x1, y1, x2, y2] = it;
        if (!finite(x1, y1, x2, y2)) return null;
        return (
          <line
            key={i}
            x1={X(x1)}
            y1={Y(y1)}
            x2={X(x2)}
            y2={Y(y2)}
            stroke="#d6b24a"
            strokeWidth={2}
            opacity={1.0}
          />
        );
      })}

      {/* Startpunkt einzeichnen (nur wenn endlich) */}
      {(() => {
        const y0 = f(startValue);
        if (!finite(startValue, y0)) return null;
        return (
          <circle
            cx={X(startValue)}
            cy={Y(y0)}
            r={5}
            fill="black"
            stroke="white"
            strokeWidth={1}
          />
        );
      })()}

      {/* Damit z.B. Punkte, Tangenten, Newton-Schritte darüber rendern */}
      <g>{typeof children === "function" ? children({ X, Y }) : children}</g>
    </svg>
  );
}
