import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { userId, handleLogout } = useContext(UserContext);

  if (!userId) return null;

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="hamburger-wrap">
      <button
        className="hamburger-btn"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {open && (
        <div className="hamburger-menu">
          <button onClick={() => { setOpen(false); navigate("/"); }}>
            Home
          </button>

          <button onClick={() => { setOpen(false); navigate("/profile"); }}>
            Profile
          </button>

          <button onClick={() => { setOpen(false); navigate("/leaderboard"); }}>
            Leaderboard
          </button>

          <div className="hamburger-divider" />

          <button onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
