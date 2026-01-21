import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ColorGrid.css";

const ColorGrid = () => {
  const navigate = useNavigate();

  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#95E1D3", // Mint
  ];

  const generateRandomGrid = () => {
    return Array(9)
      .fill(null)
      .map(() => colors[Math.floor(Math.random() * colors.length)]);
  };

  const [phase, setPhase] = useState("memorize"); // memorize, play, gameover
  const [timer, setTimer] = useState(10); // 10 seconds for memorize phase
  const [playTimer, setPlayTimer] = useState(60); // 60 seconds for play phase
  const [originalGrid, setOriginalGrid] = useState(() => generateRandomGrid()); // Random 3x3 grid to memorize
  const [userGrid, setUserGrid] = useState(Array(9).fill(null)); // Empty grid for user to fill
  const [selectedColor, setSelectedColor] = useState(null); // Currently selected color
  const [showColorGrid, setShowColorGrid] = useState(true); // Show colored grid during memorize phase

  // Memorize phase timer
  useEffect(() => {
    if (phase === "memorize" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (phase === "memorize" && timer === 0) {
      setShowColorGrid(false);
      setPhase("play");
      setPlayTimer(60);
    }
  }, [phase, timer]);

  // Play phase timer
  useEffect(() => {
    if (phase === "play" && playTimer > 0) {
      const interval = setInterval(() => {
        setPlayTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (phase === "play" && playTimer === 0) {
      // Game ends
      setPhase("gameover");
    }
  }, [phase, playTimer]);

  const calculateScore = () => {
    let correctMatches = 0;
    for (let i = 0; i < 9; i++) {
      if (userGrid[i] === originalGrid[i]) {
        correctMatches++;
      }
    }
    const percentage = Math.round((correctMatches / 9) * 100);
    return { correctMatches, percentage };
  };

  const handleColorPaletteClick = (color) => {
    setSelectedColor(selectedColor === color ? null : color);
  };

  const handleGridCellClick = (index) => {
    if (selectedColor && phase === "play") {
      setUserGrid((prev) => {
        const newGrid = [...prev];
        newGrid[index] = selectedColor;
        return newGrid;
      });
    }
  };

  const handleDone = () => {
    setPhase("gameover");
  };

  const handlePlayAgain = () => {
    setPhase("memorize");
    setTimer(10);
    setPlayTimer(60);
    setOriginalGrid(generateRandomGrid());
    setUserGrid(Array(9).fill(null));
    setSelectedColor(null);
    setShowColorGrid(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const isGridFull = userGrid.every((color) => color !== null);
  const { correctMatches, percentage } = calculateScore();

  return (
    <div className="color-grid-wrapper">
      <div className="timer-display">{phase === "memorize" ? timer : playTimer}s</div>

      {/* Memorize Phase - Show colored grid */}
      {phase === "memorize" && showColorGrid && (
        <div className="color-grid-container">
          <div className="phase-title">Memorize the colors!</div>
          <div className="color-grid">
            {originalGrid.map((color, index) => (
              <div
                key={index}
                className="color-cell"
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Play Phase - Empty grid + color palette */}
      {phase === "play" && (
        <div className="play-phase-container">
          <div className="phase-title">Fill the grid!</div>

          {/* Empty grid for user to fill */}
          <div className="color-grid-container">
            <div className="color-grid">
              {userGrid.map((color, index) => (
                <div
                  key={index}
                  className={`play-cell ${selectedColor ? "clickable" : ""}`}
                  style={{ backgroundColor: color || "#f5f5f5" }}
                  onClick={() => handleGridCellClick(index)}
                >
                  {!color && selectedColor && <div className="click-hint">+</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Color palette */}
          <div className="color-palette">
            <div className="palette-label">Select a color:</div>
            <div className="palette-grid">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`palette-color ${selectedColor === color ? "selected" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorPaletteClick(color)}
                ></div>
              ))}
            </div>
          </div>

          {/* Done Button - appears when all squares are filled */}
          {isGridFull && (
            <button className="done-btn" onClick={handleDone}>
              Done
            </button>
          )}
        </div>
      )}

      {/* Game Over Phase */}
      {phase === "gameover" && (
        <div className="gameover-container">
          <div className="phase-title">Time's up!</div>

          <div className="comparison-container">
            {/* Original Grid */}
            <div className="comparison-section">
              <div className="comparison-label">Original</div>
              <div className="color-grid">
                {originalGrid.map((color, index) => (
                  <div
                    key={index}
                    className="final-cell"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>

            {/* User's Grid */}
            <div className="comparison-section">
              <div className="comparison-label">Your Input</div>
              <div className="color-grid">
                {userGrid.map((color, index) => (
                  <div
                    key={index}
                    className="final-cell"
                    style={{ backgroundColor: color || "#f5f5f5" }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="score-details">
            <div className="score-title">Your Score</div>
            <div className="score-percentage">{percentage}%</div>
            <div className="score-matches">{correctMatches} out of 9 correct</div>
          </div>

          <div className="button-group">
            <button className="play-again-btn" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="home-btn" onClick={handleGoHome}>
              Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorGrid;
