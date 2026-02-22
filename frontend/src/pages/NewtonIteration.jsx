import { useEffect, useMemo, useState } from "react";
import { compile } from "mathjs";

import SettingsArea from "../components/settings";
import Results from "../components/results";
import DrawNewton from "../drawservice/DrawNewton";
import DrawNewtonDistance from "../drawservice/DrawNewtonDistance";

import { fetchFunctions, postForNewtonIteration } from "../services/fastapi";

import "./wholePage.css";
import "./newtonIteration.css";
import DrawNewtonNull from "../drawservice/DrawNewtonNull";

function NewtonIteration() {
  // Schaubild-Settings
  const [startValue, setStartValue] = useState(0.9);
  const [xScale, setXScale] = useState(1);
  const [yScale, setYScale] = useState(1);

  // Newton-Settings
  const [selected, setSelected] = useState({
    id: 0,
    name: "cosh(x) - 1",
    f: "cosh(x) - 1",
    df: "sinh(x)",
    null: "0",
  });

  const [numIteration, setNumIteration] = useState(10);
  const [daempfung, setDaempfung] = useState(1);

  const [functions, setFunctions] = useState([]);
  const [iterations, setIterations] = useState([]);

  // Funktionen fürs Zeichnen umwandeln (robust + nur neu kompilieren wenn String ändert)
  const { f, f_ } = useMemo(() => {
    const fString = selected?.f;
    const dfString = selected?.df;

    const fExpr =
      typeof fString === "string" && fString.trim() ? compile(fString) : null;
    const dfExpr =
      typeof dfString === "string" && dfString.trim()
        ? compile(dfString)
        : null;

    return {
      f: (x) => (fExpr ? fExpr.evaluate({ x }) : NaN),
      f_: (x) => (dfExpr ? dfExpr.evaluate({ x }) : NaN),
    };
  }, [selected?.f, selected?.df]);

  // Funktionen aus Backend laden
  useEffect(() => {
    (async () => {
      console.log("Funktionen laden...");
      try {
        const data = await fetchFunctions();
        setFunctions(data);
        console.log("Funktionen geladen", data);

        // Optional: wenn du beim Laden direkt eine gültige Default-Auswahl setzen willst
        // if (Array.isArray(data) && data.length > 0) setSelected(data[0]);
      } catch (e) {
        console.log(e?.message ?? "Unbekannter Fehler");
      }
    })();
  }, []);

  // Newton Iterationen berechnen
  useEffect(() => {
    // Nur posten, wenn selected vollständig ist
    if (
      !selected ||
      typeof selected.f !== "string" ||
      typeof selected.df !== "string" ||
      selected.id == null
    ) {
      setIterations([]);
      return;
    }

    const payload = {
      f: selected.f,
      df: selected.df,
      x0: startValue,
      n: numIteration,
      // Beispiel: Dämpfung aus Slider (0..50) -> (0.01..1.0)
      damping: daempfung,
      num_f: selected.id,
    };

    (async () => {
      try {
        const result = await postForNewtonIteration(payload);

        console.log("__________________________________________");
        console.log(payload);

        setIterations(result);
      } catch (e) {
        console.error(e);
        // wichtig, damit DrawNewton nicht mit "alten" oder kaputten Daten zeichnet
        setIterations([]);
      }
    })();
  }, [selected, startValue, numIteration, daempfung]);

  return (
    <div id="wholePage">
      <SettingsArea>
        <div id="settingDiv">
          <p>Einstellungen Schaubild</p>

          <div className="settingsBlock" id="startVal">
            <p>Startwert: {startValue.toFixed(3)}</p>
            <input
              type="range"
              min={-15}
              max={15}
              step={0.001}
              value={startValue}
              onChange={(e) => setStartValue(Number(e.target.value))}
            />
          </div>

          <div className="settingsBlock" id="xScale">
            <p>x-Scale: {xScale.toFixed(3)}</p>
            <input
              type="range"
              min={0.001}
              max={15}
              step={0.001}
              value={xScale}
              onChange={(e) => setXScale(Number(e.target.value))}
            />
          </div>

          <div className="settingsBlock" id="iterationNum">
            <p>y-Scale: {yScale.toFixed(3)}</p>
            <input
              type="range"
              min={0.001}
              max={20}
              step={0.001}
              value={yScale}
              onChange={(e) => setYScale(Number(e.target.value))}
            />
          </div>

          <p>Einstellungen Newton-Verfahren</p>

          <div className="radioArea settingsBlock" id="chooseFunction">
            <p>Funktion</p>
            {functions.map((n) => (
              <label key={n.id}>
                <input
                  type="radio"
                  name="example"
                  checked={selected?.id === n.id}
                  onChange={() => setSelected(n)}
                />
                {n.name}
              </label>
            ))}
          </div>

          <div className="settingsBlock" id="iterationNum">
            <p>Anzahl Iterationen: {numIteration.toFixed(0)}</p>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={numIteration}
              onChange={(e) => setNumIteration(Number(e.target.value))}
            />
          </div>

          <div className="settingsBlock" id="iterationNum">
            <p>Dämpfung: {daempfung}</p>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={daempfung}
              onChange={(e) => {
                setDaempfung(Number(e.target.value));
                //console.log(e.target.value);
              }}
            />
          </div>
        </div>
      </SettingsArea>

      <div id="drawArea">
        <DrawNewton
          f={f}
          f_={f_}
          width={1000}
          height={900}
          iterations={iterations}
          domain={{
            xMin: -xScale,
            xMax: xScale,
            yMin: -yScale,
            yMax: yScale,
          }}
          startValue={startValue}
        />
      </div>

      <Results>
        <div id="allResults">
          <div className="resultsBlock">
            <p>Delta-X</p>
            <DrawNewtonDistance
              width={275}
              height={400}
              iterations={iterations}
            />
          </div>
          <div className="resultsBlock">
            <p>Anäherung an Referenznullstelle: {selected["null"]}</p>
            <DrawNewtonNull
              width={275}
              height={400}
              iterations={iterations}
              currentNull={selected["null"]}
            />
          </div>
        </div>
      </Results>
    </div>
  );
}

export default NewtonIteration;
