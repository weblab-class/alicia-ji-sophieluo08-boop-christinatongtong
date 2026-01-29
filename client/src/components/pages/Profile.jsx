import { useEffect, useState } from "react";
import { get } from "../../utilities";
import "./Profile.css";

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  // add state

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
        setError("Could not load profile.");
      });
  }, []);

    // after stats load
    useEffect(() => {
      if (stats?.userName) setNameDraft(stats.userName);
    }, [stats]);

    async function saveName() {
      setError("");
      try {
        const resp = await fetch("/api/user/name", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameDraft }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.err || "Failed");

        // refresh stats (simplest: just update local)
        setStats((s) => ({ ...s, userName: data.name }));
        setIsEditing(false);
      } catch (e) {
        setError("Could not update name.");
      }
    }

  if (error) return <div>{error}</div>;
  if (!stats) return <div>Loading...</div>;


  async function deleteAccount() {
    const ok = window.confirm(
      "Delete your account? This permanently deletes all your game history. This cannot be undone."
    );
    if (!ok) return;

    setError("");
    try {
      const resp = await fetch("/api/user/me", { method: "DELETE" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.err || "Failed");

      // kick them out to home/login (your app’s routing may differ)
      window.location.href = "/";
    } catch (e) {
      setError("Could not delete account.");
    }
  }

  return (
    <div className="profile-page">
      <h1 className="profile-title">profile</h1>

      <ul className="profile-list">
      <li>
        <span className="label">Name</span>
        <span className="value">
        {isEditing ? (
          <>
            <input
              className="name-input-inline"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setNameDraft(stats.userName);
                }
              }}
            />

            <button className="save-btn" onClick={saveName}>Save</button>
            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setNameDraft(stats.userName);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {stats.userName}
            <button className="edit-btn" onClick={() => setIsEditing(true)} aria-label="Edit name" />
          </>
        )}

        </span>
      </li>


        <li>
          <span className="label">Email</span>
          <span className="value">{stats.email || "unknown / logged out"}</span>
        </li>

        <li>
          <span className="label">Best Grid Score</span>
          <span className="value">{stats.bestGridScore ?? 0}</span>
        </li>

        <li>
          <span className="label">Best Drawing Score</span>
          <span className="value">
            {stats.bestDrawingScore ?? stats.bestDrawingAccuracy ?? 0}
          </span>
        </li>

        <li>
          <span className="label">Games Played</span>
          <span className="value">{stats.gamesPlayed ?? 0}</span>
        </li>
      </ul>

      <button className="danger" onClick={deleteAccount}>
        DELETE ACCOUNT
      </button>


    </div>


  );
}
