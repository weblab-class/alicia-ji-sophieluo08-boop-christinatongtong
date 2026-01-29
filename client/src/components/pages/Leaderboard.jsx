import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { get } from "../../utilities";
import "./Leaderboard.css";

export default function Leaderboard() {
  const location = useLocation();
  const initialMode = location.state?.mode === "drawing" ? "drawing" : "grid";
  const [mode, setMode] = useState(initialMode); // "grid" | "drawing"
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [myStats, setMyStats] = useState(null);

  const ScoreCell = ({ value }) => {
    if (value !== 67) return <span className="lb-score">{value}</span>;

    return (
      <span className="lb-score lb-score-67" aria-label="67">
        <span className="digit digit-6">6</span>
        <span className="digit digit-7">7</span>
      </span>
    );
  };

  // Load leaderboard rows for selected mode
  useEffect(() => {
    setError("");
    get(`/api/stats/leaderboard?limit=10&mode=${mode}`)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Could not load leaderboard.");
        setRows([]);
      });
  }, [mode]);

  // Load current user's stats (best scores) once
  useEffect(() => {
    get("/api/whoami")
      .then((user) => {
        if (!user || !user._id) return null;
        return get(`/api/stats/user/${user._id}`);
      })
      .then((stats) => {
        if (stats) setMyStats(stats);
      })
      .catch(() => {
        // Ignore profile errors here; leaderboard can still show
      });
  }, []);

  const sorted = useMemo(() => {
    const copy = [...rows];
    return copy.sort((a, b) => (b.score - a.score) || ((a.createdAt || 0) - (b.createdAt || 0)));
  }, [rows]);

  // Only show a "best" value if user has attempted (non-null and not 0)
  const myBestValue = useMemo(() => {
    if (!myStats) return null;
    const raw = mode === "grid" ? myStats.bestGridScore : (myStats.bestDrawingScore ?? myStats.bestDrawingAccuracy);
    if (raw == null || raw === 0) return null;
    return raw;
  }, [myStats, mode]);

  const myRowIndex = useMemo(() => {
    if (!myStats) return -1;
    return sorted.findIndex((g) => g.userId && g.userId.toString() === myStats.userId.toString());
  }, [sorted, myStats]);

  // Show "your best" row at bottom (rank –) when not in top 10; applies to both grid and drawing
  const showMyExtraRow = !error && sorted.length > 0 && myStats && myBestValue && myRowIndex === -1;

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">leaderboard</h1>

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

      {!error && sorted.length > 0 && (
        <>
          <div className="lb-header">
            <div className="lb-header-cell">Rank</div>
            <div className="lb-header-cell">Score</div>
            <div className="lb-header-cell">Name</div>
          </div>

          <div className="lb-list">
            {sorted.map((g, i) => {
              const isMe = myStats && g.userId && g.userId.toString() === myStats.userId.toString();
              const rankClass =
                i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "";
              return (
                <div
                  className={`lb-row ${rankClass} ${isMe ? "lb-row-me" : ""}`}
                  key={g.gameId || i}
                >
                  <div className="lb-cell lb-rank">{i + 1}</div>
                  <div className="lb-cell lb-score">
                    <ScoreCell value={g.score} />
                  </div>
                  <div className="lb-cell lb-name">{g.userName || "Anonymous"}</div>
                </div>
              );
            })}

            {showMyExtraRow && (
              <div className="lb-row lb-row-me lb-row-mybest">
                <div className="lb-cell lb-rank">–</div>
                <div className="lb-cell lb-score">
                  <ScoreCell value={myBestValue} />
                </div>
                <div className="lb-cell lb-name">{myStats.userName || "You"}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
