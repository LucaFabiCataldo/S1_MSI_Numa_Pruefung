import { useState } from "react";
import "./App.css";

import NewtonIteration from "./pages/NewtonIteration";
import GaussElimination from "./pages/GaussElimination";
import LRZerlegung from "./pages/LR";
import SplineInterpolation from "./pages/SplineInterpolation";

function App() {
  const [page, setPage] = useState("Newton");

  const renderPage = () => {
    switch (page) {
      case "Newton":
        return <NewtonIteration />;
      case "Gauss":
        return <GaussElimination />;
      case "LR":
        return <LRZerlegung />;
      case "Spline":
        return <SplineInterpolation />;
      default:
        return <NewtonIteration />;
    }
  };

  const menuItem = (key, label) => (
    <div
      className={`headerBlock ${page === key ? "activePage" : "inactivePage"}`}
      onClick={() => setPage(key)}
    >
      <p className="headerBlockPage">{label}</p>
    </div>
  );

  /*
      <header id="header">
        {menuItem("Newton", "NewtonIteration")}
        {menuItem("Gauss", "Gauß-Elimination")}
        {menuItem("LR", "LR-Zerlegung")}
        {menuItem("Spline", "Spline-Interpolation")}
      </header>
  */

  return (
    <>
      <div id="currentPage">
        {page === "Newton" && <NewtonIteration />}
        {page === "Gauss" && <GaussElimination />}
        {page === "LR" && <LRZerlegung />}
        {page === "Spline" && <SplineInterpolation />}
      </div>
    </>
  );
}

export default App;
