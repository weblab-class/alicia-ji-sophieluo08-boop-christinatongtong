import { useEffect, useState } from "react";
import { get } from "../../utilities";
import "./Profile.css"

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    get("/api/whoami")
      .then(setUser)
      .catch(console.error);
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile</h1>

      <ul className="profile-list">
        <li>
          <span className="label">Name</span>
          <span className="value">{user.name}</span>
        </li>

        <li>
          <span className="label">Email</span>
          <span className="value">{user.email || "Not provided"}</span>
        </li>

        <li>
          <span className="label">Best Score</span>
          <span className="value">{user.bestScore ?? "-"}</span>
        </li>
      </ul>
    </div>
  );


}
