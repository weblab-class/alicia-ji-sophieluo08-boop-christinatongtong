import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { userId, handleLogout } = useContext(UserContext);

  if (!userId) return null; // don't render if logged out

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
    setOpen(false);
  };

  return (
    <div className="hamburger-container">
      <button
        className="hamburger-button"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {open && (
        <div className="dropdown-menu">
          <button onClick={() => { setOpen(false); navigate("/profile"); }}>
            Profile
          </button>
          <button onClick={() => { setOpen(false); navigate("/leaderboard"); }}>
            Leaderboard
          </button>
          <button onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
