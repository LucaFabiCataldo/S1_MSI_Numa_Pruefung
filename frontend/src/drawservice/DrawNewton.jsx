import { useMemo } from "react";

export default function DrawNewton({
  f,
  f_,
  width,
  height,
  iterations,
  domain = { xMin, xMax, yMin, yMax },
  startValue,
  samples = 500,
  showAxes = true,
  children,
}) {
  const { xMin, xMax, yMin, yMax } = domain;

  const { X, Y } = useMemo(() => {
    const sx = width / (xMax - xMin);
    const sy = height / (yMax - yMin);

    return {
      X: (x) => (x - xMin) * sx,
      Y: (y) => height - (y - yMin) * sy, // SVG y-Achse invertiert
    };
  }, [width, height, xMin, xMax, yMin, yMax]);

  //Graph erzeugen
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const x = xMin + (i / samples) * (xMax - xMin);
      const y = f(x);

      if (Number.isFinite(y)) {
        pts.push(`${X(x)},${Y(y)}`);
      }
    }
    return pts.join(" ");
  }, [f, samples, xMin, xMax, X, Y]);

  //Steigung erzeugen
  const gradient = f_(startValue);

  //Startpunkt erzeugen

  const xAxisY = Y(0);
  const yAxisX = X(0);

  return (
    //SVG zeichnen
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

      {/*Graph einzeichnen*/}
      <polyline points={points} fill="none" stroke="#57cdA5" strokeWidth="2" />

      {/*Steigung einzeichnen*/}
      <line
        x1={X(startValue - 40)}
        y1={Y(f(startValue) - 40 * gradient)}
        x2={X(startValue + 40)}
        y2={Y(f(startValue) + 40 * gradient)}
        stroke="#63a8ce"
      />

      {/*Newton-Schritte zeichnen*/}
      {console.log("ITERATIONEN")}
      {console.log(iterations)}
      {/*console.log(iterations[0])*/}
      {iterations.map((it, i) => (
        <line
          key={i}
          x1={X(it[0])}
          y1={Y(it[1])}
          x2={X(it[2])}
          y2={Y(it[3])}
          stroke="#d6b24a"
          strokeWidth={2}
          opacity={1.0}
        />
      ))}

      {/*Starpunkt einzeichnen*/}
      <circle
        cx={X(startValue)}
        cy={Y(f(startValue))}
        r={5}
        fill="black"
        stroke="white"
        strokeWidth={1}
      />

      {/* Damit z.B. Punkte, Tangenten, Newton-Schritte darüber rendern*/}
      <g>{typeof children === "function" ? children({ X, Y }) : children}</g>
    </svg>
  );
}
