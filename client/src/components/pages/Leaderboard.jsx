import React, { useEffect, useState } from "react";
import { get } from "../../utilities";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const sorted = [...rows].sort(
    (a, b) => (b.accuracy - a.accuracy) || (a.timeTaken - b.timeTaken)
  );


  useEffect(() => {
    get("/api/stats/leaderboard?limit=10&sortBy=score")
      .then((data) => setRows(data || []))
      .catch((e) => {
        console.error("Leaderboard fetch failed:", e);
        setError("Could not load leaderboard.");
      });
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h1 className="leaderboard-title">Leaderboard</h1>

      {error && <p>{error}</p>}

      {!error && rows.length === 0 && <p>No completed games yet.</p>}

      {rows.length > 0 && (
        <ol>
          {rows.map((g) => (
            <div className="lb-row" key={g.gameId}>
            <div className="lb-left">
              <div className="lb-score">{g.accuracy}%</div>
              <div className="lb-time">{g.timeTaken}s</div>
            </div>

            <div className="lb-name">
              {g.userName || "Anonymous"}
            </div>
          </div>

          ))}
        </ol>
      )}
    </div>
  );
}
