import React, { useState, useEffect } from "react";
import "./ColorGrid.css";

const ColorGrid = () => {
  const colors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#95E1D3", // Mint
    "#C7CEEA", // Lavender
    "#FF8B94", // Pink
    "#B4A7D6", // Purple
    "#73A580", // Green
    "#FFA07A", // Light Salmon
  ];

  const [phase, setPhase] = useState("memorize"); // memorize, play
  const [timer, setTimer] = useState(10); // 10 seconds for memorize phase
  const [playTimer, setPlayTimer] = useState(60); // 60 seconds for play phase
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
      setSelectedColor(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="color-grid-wrapper">
      <div className="timer-display">{phase === "memorize" ? timer : playTimer}s</div>

      {/* Memorize Phase - Show colored grid */}
      {phase === "memorize" && showColorGrid && (
        <div className="color-grid-container">
          <div className="phase-title">Memorize the colors!</div>
          <div className="color-grid">
            {colors.map((color, index) => (
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
                {colors.map((color, index) => (
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

          <div className="score">You filled {userGrid.filter((c) => c !== null).length} out of 9 squares</div>
        </div>
      )}
    </div>
  );
};

export default ColorGrid;
