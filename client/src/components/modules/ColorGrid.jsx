// Color name to hex mapping for comparison phase
const COLOR_MAP = {
  red: "#FF6B6B",
  blue: "#4ECDC4",
  yellow: "#FFE66D",
  green: "#73A580",
  purple: "#B4A7D6",
  orange: "#FFA07A",
};
// Helper to map color names to hex
const getColorHex = (color) => {
  if (!color) return "#f5f5f5";
  const colorMap = {
    red: "#FF6B6B",
    blue: "#4ECDC4",
    yellow: "#FFE66D",
    green: "#73A580",
    purple: "#B4A7D6",
    orange: "#FFA07A",
    // fallback for direct hex
  };
  return colorMap[color] || color;
};
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ColorGrid.css";

const ColorGrid = ({
  gameId,
  gridSize,
  timeLimit,
  colorBank,
  correctPattern,
  difficulty
}) => {
  // Use colorBank from props, fallback to default if missing
  const defaultColors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#95E1D3", // Mint
  ];
  const colors = colorBank && colorBank.length > 0 ? colorBank.map((c) => {
    // If colorBank is color names, map to hex, else use as is
    const colorMap = {
      red: "#FF6B6B",
      blue: "#4ECDC4",
      yellow: "#FFE66D",
      green: "#73A580",
      purple: "#B4A7D6",
      orange: "#FFA07A",
    };
    return colorMap[c] || c;
  }) : defaultColors;

  const generateRandomGrid = () => {
    return Array(9)
      .fill(null)
      .map(() => colors[Math.floor(Math.random() * colors.length)]);
  };

  const [phase, setPhase] = useState("memorize"); // memorize, play
  const [timer, setTimer] = useState(timeLimit || 10); // use timeLimit from props
  const [playTimer, setPlayTimer] = useState(60); // 60 seconds for play phase
  const [userGrid, setUserGrid] = useState(Array(gridSize * gridSize).fill(null)); // Empty grid for user to fill
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
      setPlayTimer(15);
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
      //setSelectedColor(null);
    }
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

  // const handleGoHome = () => {
  //   navigate("/");
  // };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const totalCells = userGrid.length;
  const filledCells = userGrid.filter((c) => c !== null).length;

  //const score = (filledCells / totalCells) * 100;

  const handleGoHome = () => {
    navigate("/");
  };

  const isGridFull = userGrid.every((color) => color !== null);

  const calculateScore = () => {
    let correctMatches = 0;
    for (let i = 0; i < userGrid.length; i++) {
      const expected = correctPattern[i.toString()];
      if (userGrid[i] && expected && getColorHex(userGrid[i]) === getColorHex(expected)) {
        correctMatches++;
      }
    }
    const percentage = Math.round((correctMatches / userGrid.length) * 100);
    return { correctMatches, percentage };
  };

  const { correctMatches, percentage } = calculateScore();
  // Create grid style based on gridSize
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gap: "8px",
  };

  return (
    <div className="color-grid-wrapper">
      <div className="timer-display">{phase === "memorize" ? timer : playTimer}s</div>

      {/* Memorize Phase - Show colored grid */}
      {phase === "memorize" && showColorGrid && (
        <div className="color-grid-container">
          <div className="phase-title">Memorize the colors!</div>
          <div className="color-grid" style={gridStyle}>
            {Array.from({ length: gridSize * gridSize }, (_, index) => {
              const colorName = correctPattern[index.toString()];
              // Map color name to hex
              const colorMap = {
                red: "#FF6B6B",
                blue: "#4ECDC4",
                yellow: "#FFE66D",
                green: "#73A580",
                purple: "#B4A7D6",
                orange: "#FFA07A",
              };
              const colorHex = colorMap[colorName] || colorName || "#f5f5f5";
              return (
                <div
                  key={index}
                  className="color-cell"
                  style={{ backgroundColor: colorHex }}
                ></div>
              );
            })}
          </div>
        </div>
      )}

      {/* Play Phase - Empty grid + color palette */}
      {phase === "play" && (
        <div className="play-phase-container">
          <div className="phase-title">Fill the grid!</div>

          {/* Empty grid for user to fill */}
          <div className="color-grid-container">
            <div className="color-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {userGrid.map((color, index) => (
                <div
                  key={index}
                  className={`play-cell ${selectedColor ? "clickable" : ""} ${color ? "filled" : ""}`}
                  style={{ backgroundColor: color ? getColorHex(color) : "#f5f5f5" }}
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

          {/* Done button appears when all squares are filled */}
          {userGrid.every((c) => c !== null) && (
            <button className="done-btn" onClick={() => setPhase("gameover")}>Done</button>
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
              <div className="color-grid" style={gridStyle}>
                {Array.from({ length: userGrid.length }, (_, index) => {
                  const expected = correctPattern[index.toString()];
                  const hex = expected ? (COLOR_MAP[expected] || "#CCCCCC") : "#f5f5f5";
                  return (
                    <div key={index} className="final-cell" style={{ backgroundColor: hex }}></div>
                  );
                })}
              </div>
            </div>

            {/* User's Grid */}
            <div className="comparison-section">
              <div className="comparison-label">Your Input</div>
              <div className="color-grid" style={gridStyle}>
                {userGrid.map((colorName, index) => (
                  <div
                    key={index}
                    className="final-cell"
                    style={{ backgroundColor: getColorHex(colorName) }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="score-details">
            <div className="score-title">Your Score</div>
            <div className="score-percentage">{percentage}%</div>
            <div className="score-matches">{correctMatches} out of {userGrid.length} correct</div>
          </div>

          <div className="button-group">
            <button className="play-again-btn" onClick={() => window.location.href = "/"}>
              Play Again
            </button>

            {/* TODO: Add "onLeaderboard" function later */}
            <button className="result-button leaderboard-button">
                Leaderboard
            </button>
        </div>

        </div>
      )}
    </div>
  );
};

export default ColorGrid;
