import React, { useEffect, useMemo, useState } from "react";
import { get } from "../../utilities";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [mode, setMode] = useState("grid"); // "grid" | "drawing"
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const ScoreCell = ({ value }) => {
    if (value !== 67) return <span className="lb-score">{value}</span>;

    return (
      <span className="lb-score lb-score-67" aria-label="67">
        <span className="digit digit-6">6</span>
        <span className="digit digit-7">7</span>
      </span>
    );
  };



  useEffect(() => {
    setError("");
    get(`/api/stats/leaderboard?limit=10&mode=${mode}`)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e);
        setError("Could not load leaderboard.");
        setRows([]);
      });
  }, [mode]);

  // Optional backup sort (in case backend changes)
  const sorted = useMemo(() => {
    const copy = [...rows];
    if (mode === "grid") {
      return copy.sort((a, b) => (b.score - a.score) || (a.timeTaken - b.timeTaken));
    }
    return copy.sort((a, b) => (b.accuracy - a.accuracy) || (a.timeTaken - b.timeTaken));
  }, [rows, mode]);

  return (
    <div className="lb-page">
      <h1 className="lb-title">Leaderboard</h1>

      <div className="lb-tabs" role="tablist" aria-label="Leaderboard tabs">
        <button
          className={`lb-tab ${mode === "grid" ? "active" : ""}`}
          onClick={() => setMode("grid")}
          role="tab"
          aria-selected={mode === "grid"}
          type="button"
        >
          Grid
        </button>
        <button
          className={`lb-tab ${mode === "drawing" ? "active" : ""}`}
          onClick={() => setMode("drawing")}
          role="tab"
          aria-selected={mode === "drawing"}
          type="button"
        >
          Drawing
        </button>
      </div>

      {error && <p className="lb-error">{error}</p>}

      {!error && sorted.length === 0 && (
        <p className="lb-empty">No completed games yet.</p>
      )}

      <div className="lb-list">
        {sorted.map((g, i) => (
          <div className="lb-row" key={g.gameId || i}>
            <div className="lb-left">
            <div className="lb-score">
            {mode === "grid" ? (
                <ScoreCell value={g.score} />
            ) : (`${g.accuracy}%`)}
            </div>
              <div className="lb-time">{g.timeTaken}s</div>
            </div>

            <div className="lb-name">{g.userName || "Anonymous"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
