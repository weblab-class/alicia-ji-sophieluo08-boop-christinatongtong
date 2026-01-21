import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { UserContext } from "../App";
import DifficultySelector from "../modules/DifficultySelector";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  useEffect(() => {
    console.log("Home component - userId changed:", userId);
    console.log("Home component - will show:", userId ? "game content" : "login");
  }, [userId]);

  const handleDifficultySelect = (difficultyData) => {
    setSelectedDifficulty(difficultyData);
  };

  const handleStartGame = () => {
    if (selectedDifficulty) {
      // Navigate to game page with difficulty data in state
      navigate("/game", {
        state: {
          difficulty: selectedDifficulty.difficulty,
          gridSize: selectedDifficulty.gridSize,
          timeLimit: selectedDifficulty.timeLimit,
        },
      });
    }
  };

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="app-title">FILL</h1>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div style={{ color: "white", fontSize: "12px", marginBottom: "10px" }}>
            Debug: userId = {userId ? userId : "null"}
          </div>
        )}

        {!userId ? (
          <div className="login-section">
            <p className="login-prompt">Please log in to play</p>
            <GoogleLogin
              onSuccess={handleLogin}
              onError={(err) => {
                console.error("Google login error:", err);
                alert("Google login failed. Please try again.");
              }}
            />
          </div>
        ) : (
          <>
            <DifficultySelector onDifficultySelect={handleDifficultySelect} />
            <button
              className={`play-button ${!selectedDifficulty ? "disabled" : ""}`}
              onClick={handleStartGame}
              disabled={!selectedDifficulty}
            >
              Start Game
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
