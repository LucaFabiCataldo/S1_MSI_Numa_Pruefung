import { useEffect, useState } from "react";

import { compile } from "mathjs";

import SettingsArea from '../components/settings'
import Results from '../components/results'
import DrawNewton from '../drawservice/DrawNewton'

import { fetchFunctions } from '../services/fastapi'
import { postForNewtonIteration } from "../services/fastapi";

import './wholePage.css'
import './newtonIteration.css'

function NewtonIteration() {
  
  //Schaubild-Settings
  const [startValue, setStartValue] = useState(0);
  const [xScale, setXScale] = useState(1);
  const [yScale, setYScale] = useState(2);
  
  //Newton-Settings
  const [selected, setSelected] = useState(["cosh(x) - 1",
     "cosh(x) - 1",
     "sinh(x)",
     "lambda x: math.cosh(x) - 1",
     "lambda x: math.sinh(x)",
     0
    ]);
  const [numIteration, setNumIteration] = useState(3);
  const [daempfung, setDaempfung] = useState(0);

  //Funktionen fürs Zeichnen umwandeln
  const fString = selected[1];
  const fExpr = compile(fString);
  const f = (x) => fExpr.evaluate({ x });
  const f_String = selected[2];
  const f_Expr = compile(f_String);
  const f_ = (x) => f_Expr.evaluate({ x });


  const [functions, setFunctions] = useState([]);
  const [iterations, setIterations] = useState([])

  //Funktionen aus Backend laden (wird in useEffect aufgerufen)
  async function load() {
    console.log("Funktionen laden...")
    try {
      const data = await fetchFunctions();
      setFunctions(data);
      console.log("Funktionen geladen")
      console.log(data)
    } catch (e) {
      console.log(e?.message ?? "Unbekannter Fehler");
    } 
  }

  //Funktionen aus Backend laden
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const payload = {
      f: selected[0],
      df: selected[1],
      x0: startValue,
      n: numIteration,
      damping: 1.0,
      num_f: selected[5],
    };

    (async () => {
      const result = await postForNewtonIteration(payload);
      setIterations(result);
    })();
  }, [selected, startValue, numIteration, daempfung]);

  return (
    <>
      <div id='wholePage'>
        <SettingsArea>

          <div id='settingDiv'>
            <p>Einstellungen Schaubild</p>
            <div className='settingsBlock' id='startVal'>
              <p>Startwert: {startValue.toFixed(2)}</p>
              <input
                type="range"
                min={-20}
                max={20}
                step={0.01}
                value={startValue}
                onChange={(e) => 
                  setStartValue(Number(e.target.value))
                  
                }
                />
            </div>
            <div className='settingsBlock' id='iterationNum'>
              <p>x-Scale: {xScale.toFixed(2)}</p>
              <input
                type="range"
                min={1}
                max={20}
                step={0.01}
                value={xScale}
                onChange={(e) => setXScale(Number(e.target.value))}
              />
            </div>
            <div className='settingsBlock' id='iterationNum'>
              <p>y-Scale: {yScale.toFixed(2)}</p>
              <input
                type="range"
                min={0.05}
                max={20}
                step={0.01}
                value={yScale}
                onChange={(e) => setYScale(Number(e.target.value))}
              />
            </div>
            <p>Einstellungen Newton-Verfahren</p>
            <div className='radioArea settingsBlock' id='chooseFunction'>
              <p>Funktion</p>
              {functions.map(n => (
                <label>
                  <input
                    type="radio"
                    name="example"
                    value={n[1]}
                    checked={selected?.[5] === n?.[5]}
                    onChange={(e) => {
                      setSelected(n)
                      console.log(n)
                      }
                    }
                    />
                  {n[0]}
                </label>
              ))}
            </div>
            <div className='settingsBlock' id='iterationNum'>
              <p>Anzahl Iterationen: {numIteration.toFixed(0)}</p>
              <input
                type="range"
                min={0}
                max={15}
                step={1.0}
                value={numIteration}
                onChange={(e) => {
                  setNumIteration(Number(e.target.value))
                }
              }
              />
            </div>
            <div className='settingsBlock' id='iterationNum'>
              <p>Dämpfung: {daempfung.toFixed(0)}</p>
              <input
                type="range"
                min={0}
                max={50}
                step={1.0}
                value={daempfung}
                onChange={(e) => setDaempfung(Number(e.target.value))}
              />
            </div>
          </div>
        </SettingsArea>
        <div id='drawArea'>
          <DrawNewton
            f={f}
            f_={f_}
            width={1000}
            height={900}
            iterations={iterations}
            domain={{ xMin: -xScale, xMax: xScale, yMin: -yScale, yMax: yScale }}
            startValue={startValue}
            >
          </DrawNewton>
        </div>
        <Results>
          <p>HEELLOO</p>
        </Results>
      </div>
    </>
  )
}

export default NewtonIteration
