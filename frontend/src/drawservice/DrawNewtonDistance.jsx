import { useMemo } from "react";

export default function DrawNewtonDistance({
  width,
  height,
  iterations,
  showAxes = true,
  children,
}) {
  const paddingLeft = 20;
  const paddingTop = 50;
  const paddingBottom = 30;

  const heightWOPadd = height - paddingTop - paddingBottom;
  const heightWOBottomPadd = height - paddingBottom;

  // Max-Wert passend zur Balkenhöhe berechnen: |x_{k+1} - x_k|
  // + robust gegen leere Arrays / 0
  const { maxValue, xSpacing } = useMemo(() => {
    const diffs = (iterations ?? []).map((arr) => Math.abs(arr[2] - arr[0]));
    const maxValue = diffs.length ? Math.max(...diffs) : 1; // nie -Infinity
    const xSpacing =
      (iterations ?? []).length > 0
        ? (width - paddingLeft) / iterations.length
        : 0;

    return { maxValue: maxValue || 1, xSpacing };
  }, [iterations, width]);

  return (
    <svg width={width} height={height} style={{ backgroundColor: "#ffffff00" }}>
      {(iterations ?? []).map((it, i) => {
        const currentIdxSpace = i * xSpacing + paddingLeft;

        const diff = Math.abs(it[2] - it[0]);

        // Balkenhöhe in Pixeln (robust gegen 0)
        const barHeight = maxValue > 0 ? (heightWOPadd * diff) / maxValue : 0;

        const currentXChange = heightWOBottomPadd - barHeight;

        // SVG mag kein NaN/Infinity: falls irgendwas schiefgeht -> skip
        if (
          !Number.isFinite(currentIdxSpace) ||
          !Number.isFinite(currentXChange) ||
          !Number.isFinite(heightWOBottomPadd)
        ) {
          return null;
        }

        return (
          <g key={i}>
            <line
              x1={currentIdxSpace}
              y1={heightWOBottomPadd}
              x2={currentIdxSpace}
              y2={currentXChange}
              stroke="#d6b24a"
              strokeWidth={15}
              opacity={1.0}
            />

            {/* Text über der Linie */}
            <text
              x={currentIdxSpace}
              y={currentXChange - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#ffffff"
              transform={`rotate(-90, ${currentIdxSpace - 5}, ${currentXChange - 20})`}
            >
              {diff.toFixed(4)}
            </text>

            {/* Text unter der Linie */}
            <text
              x={currentIdxSpace}
              y={heightWOBottomPadd + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#ffffff"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* children NICHT mit X/Y aufrufen, weil X/Y hier nicht existieren */}
      {children ? (
        <g>{typeof children === "function" ? children() : children}</g>
      ) : null}
    </svg>
  );
}
