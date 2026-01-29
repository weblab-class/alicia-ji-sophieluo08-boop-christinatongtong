import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import DifficultySelector from "../modules/DifficultySelector";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const difficultyMap = {
    easy: { difficulty: "easy", gridSize: 3, timeLimit: 20 },
    medium: { difficulty: "medium", gridSize: 4, timeLimit: 20 },
    hard: { difficulty: "hard", gridSize: 5, timeLimit: 20 },
  };

  const startGridMode = (difficultyData) => {
    const difficulty = difficultyData || difficultyMap.medium;
    navigate("/game", {
      state: {
        ...difficulty,
        mode: "grid",
      },
    });
  };

  const startPictureMode = () => {
    const difficulty = difficultyMap.medium;
    navigate("/game", {
      state: {
        ...difficulty,
        mode: "drawing",
      },
    });
  };

  const handleOpenGrid = () => {
    setSelectedDifficulty(null);
    setShowDifficultyModal(true);
  };

  const handleDifficultySelect = (difficultyData) => {
    setSelectedDifficulty(difficultyData);
  };

  const handlePlayClick = () => {
    if (selectedDifficulty) {
      startGridMode(selectedDifficulty);
      setShowDifficultyModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowDifficultyModal(false);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="app-title">
          <img
            src="/paint_bucket.png"
            alt="Paint bucket"
            className="app-logo"
          />
          palette
        </h1>

        {!userId ? (
          <div className="login-section">
            <p className="login-prompt">login to play</p>
            <GoogleLogin
              onSuccess={handleLogin}
              onError={(err) => {
                alert("Google login failed. Please try again.");
              }}
            />
            <div className="login-canvas-decoration">
              <div className="mini-canvas">
                <img 
                  src="/paint-brush.png" 
                  alt="Animated brush" 
                  className="animated-brush"
                />
                <div className="mini-palette">
                  <div className="mini-palette-color"></div>
                  <div className="mini-palette-color"></div>
                  <div className="mini-palette-color"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mode-select stacked">
              <div className="mode-card big">
                <div className="mode-preview">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <rect x="5" y="5" width="20" height="20" fill="#FF6B6B" rx="2"/>
                    <rect x="30" y="5" width="20" height="20" fill="#4ECDC4" rx="2"/>
                    <rect x="55" y="5" width="20" height="20" fill="#FFE66D" rx="2"/>
                    <rect x="5" y="30" width="20" height="20" fill="#73A580" rx="2"/>
                    <rect x="30" y="30" width="20" height="20" fill="#B4A7D6" rx="2"/>
                    <rect x="55" y="30" width="20" height="20" fill="#FFA07A" rx="2"/>
                    <rect x="5" y="55" width="20" height="20" fill="#FFE66D" rx="2"/>
                    <rect x="30" y="55" width="20" height="20" fill="#FF6B6B" rx="2"/>
                    <rect x="55" y="55" width="20" height="20" fill="#4ECDC4" rx="2"/>
                  </svg>
                </div>
                <button className="mode-button" onClick={handleOpenGrid}>Grid Mode</button>
              </div>

              <div className="mode-card big">
                <div className="mode-preview">
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <ellipse cx="50" cy="65" rx="35" ry="30" fill="#FF6B6B"/>
                    <rect x="45" y="20" width="10" height="15" fill="#73A580" rx="2"/>
                    <ellipse cx="48" cy="18" rx="8" ry="5" fill="#73A580"/>
                  </svg>
                </div>
                <button className="mode-button" onClick={startPictureMode}>Picture Mode</button>
              </div>
            </div>

            {showDifficultyModal && (
              <div className="modal-backdrop" onClick={handleCloseModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <button className="close-btn" onClick={handleCloseModal}>x</button>
                  </div>
                  <DifficultySelector onDifficultySelect={handleDifficultySelect} />
                  {selectedDifficulty && (
                    <button className="modal-play-button" onClick={handlePlayClick}>
                      Play
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
