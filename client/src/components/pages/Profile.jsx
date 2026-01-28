import { useEffect, useState } from "react";
import { get } from "../../utilities";
import "./Profile.css";

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // first get whoami just to know who the user is
    get("/api/whoami")
      .then((user) => {
        if (!user || !user._id) {
          throw new Error("Not logged in");
        }
        // then fetch LIVE stats from DB
        return get(`/api/stats/user/${user._id}`);
      })
      .then(setStats)
      .catch((err) => {
        console.error(err);
        setError("Could not load profile.");
      });
  }, []);

  if (error) return <div>{error}</div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1 className="profile-title">profile</h1>

      <ul className="profile-list">
        <li>
          <span className="label">Name</span>
          <span className="value">{stats.userName}</span>
        </li>

        <li>
          <span className="label">Best Grid Score</span>
          <span className="value">{stats.bestGridScore ?? 0}</span>
        </li>

        <li>
          <span className="label">Best Drawing Accuracy</span>
          <span className="value">
            {stats.bestDrawingAccuracy ?? 0}%
          </span>
        </li>

        <li>
          <span className="label">Games Played</span>
          <span className="value">{stats.gamesPlayed ?? 0}</span>
        </li>
      </ul>
    </div>
  );
}
