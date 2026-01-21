import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ColorGrid.css";

// map color names to hex codes
const COLOR_MAP = {
  red: "#FF6B6B",
  blue: "#4ECDC4",
  green: "#73A580",
  yellow: "#FFE66D",
  purple: "#B4A7D6",
  orange: "#FFA07A",
};

const ColorGrid = ({ gameId, gridSize, timeLimit, colorBank, correctPattern }) => {
  // Safety check - if required props are not provided, return early
  if (!gridSize || !correctPattern || !colorBank) {
    console.log("ColorGrid missing props:", { gridSize, correctPattern, colorBank });
    return (
      <div className="color-grid-wrapper">
        <div style={{ color: "#333", fontSize: "20px", padding: "20px" }}>
          Loading game data...
        </div>
      </div>
    );
  }

  const totalSquares = gridSize * gridSize;
  const navigate = useNavigate();

  const [phase, setPhase] = useState("memorize"); // memorize, play, gameover
  const [timer, setTimer] = useState(timeLimit || 20);
  const [playTimer, setPlayTimer] = useState(60);
  const [userGrid, setUserGrid] = useState(Array(totalSquares).fill(null));
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorGrid, setShowColorGrid] = useState(true); // Show colored grid during memorize phase

  const paletteColors = colorBank ? colorBank.map(name => ({
    name: name,
    hex: COLOR_MAP[name] || "#CCCCCC"
  })) : [];

  // initialize timer with timeLimit from props
  useEffect(() => {
    if (timeLimit) {
      setTimer(timeLimit);
    }
  }, [timeLimit]);

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

  const handleColorPaletteClick = (colorName) => {
    setSelectedColor(selectedColor === colorName ? null : colorName);
  };

  const handleGridCellClick = (index) => {
    if (selectedColor && phase === "play") {
      setUserGrid((prev) => {
        const newGrid = [...prev];
        newGrid[index] = selectedColor; // Store color name
        return newGrid;
      });
      setSelectedColor(null);
    }
  };

  const handleDone = () => {
    setPhase("gameover");
  };

  const getColorHex = (colorName) => {
    return colorName ? (COLOR_MAP[colorName] || "#CCCCCC") : "#f5f5f5";
  };

  const handlePlayAgain = () => {
    navigate("/"); // Navigate back to home to start a new game
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const isGridFull = userGrid.every((color) => color !== null);

  // Create grid style based on gridSize
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gap: "8px",
  };

  return (
    <div className="color-grid-wrapper">
      <div className="timer-display">{phase === "memorize" ? timer : playTimer}s</div>

      {phase === "memorize" && showColorGrid && correctPattern && (
        <div className="color-grid-container">
          <div className="phase-title">Memorize the colors!</div>
          <div className="color-grid" style={gridStyle}>
            {Array.from({ length: totalSquares }, (_, index) => {
              const colorName = correctPattern[index.toString()];
              const hexColor = colorName ? COLOR_MAP[colorName] || "#CCCCCC" : "#f5f5f5";
              return (
                <div
                  key={index}
                  className="color-cell"
                  style={{ backgroundColor: hexColor }}
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
            <div className="color-grid" style={gridStyle}>
              {userGrid.map((colorName, index) => (
                <div
                  key={index}
                  className={`play-cell ${selectedColor ? "clickable" : ""}`}
                  style={{ backgroundColor: getColorHex(colorName) }}
                  onClick={() => handleGridCellClick(index)}
                >
                  {!colorName && selectedColor && <div className="click-hint">+</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Color palette */}
          <div className="color-palette">
            <div className="palette-label">Select a color:</div>
            <div className="palette-grid">
              {paletteColors.map((color, index) => (
                <div
                  key={index}
                  className={`palette-color ${selectedColor === color.name ? "selected" : ""}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorPaletteClick(color.name)}
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
          <div className="final-grid">
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
          <div className="score">You filled {userGrid.filter((c) => c !== null).length} out of {totalSquares} squares</div>
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
