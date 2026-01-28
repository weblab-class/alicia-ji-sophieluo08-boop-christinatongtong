import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { userId, handleLogout } = useContext(UserContext);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

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
        ref={buttonRef}
        className="hamburger-btn"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {open && (
        <div ref={menuRef} className="hamburger-menu">
          <button className="menu-item" onClick={() => { setOpen(false); navigate("/"); }}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </button>

          <button className="menu-item" onClick={() => { setOpen(false); navigate("/profile"); }}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Profile</span>
          </button>

          <button className="menu-item" onClick={() => { setOpen(false); navigate("/leaderboard"); }}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="6" width="16" height="2" fill="currentColor"/>
              <rect x="4" y="11" width="16" height="2" fill="currentColor"/>
              <rect x="4" y="16" width="16" height="2" fill="currentColor"/>
            </svg>
            <span>Leaderboard</span>
          </button>

          <div className="hamburger-divider" />

          <button className="menu-item" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
