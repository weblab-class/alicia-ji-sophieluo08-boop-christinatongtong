import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { userId, handleLogin, handleLogout } = useContext(UserContext);

  const handlePlayClick = () => {
    navigate("/game");
  };

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="app-title">FILL</h1>

        {!userId ? (
          <div className="login-section">
            <p className="login-prompt">Please log in to play</p>
            <GoogleLogin
              onSuccess={handleLogin}
              onError={(err) => console.log(err)}
            />
          </div>
        ) : (
          <>
            <button className="play-button" onClick={handlePlayClick}>
              Play!
            </button>
            <button className="logout-button" onClick={handleLogoutClick}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
