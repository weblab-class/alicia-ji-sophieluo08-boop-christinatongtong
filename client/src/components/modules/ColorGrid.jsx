import DrawingGrid from "./DrawingGrid";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../../utilities"; // adjust path if needed
import "./ColorGrid.css";

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
  };
  return colorMap[color] || color;
};

// Helper to map hex to color names
const getColorName = (hex) => {
  const reverseColorMap = {
    "#FF6B6B": "red",
    "#4ECDC4": "blue",
    "#FFE66D": "yellow",
    "#73A580": "green",
    "#B4A7D6": "purple",
    "#FFA07A": "orange",
  };
  return reverseColorMap[hex] || hex;
};

const ColorGrid = ({
  gameId,
  gridSize,
  timeLimit,
  playTimeLimit,
  colorBank,
  correctPattern,
  difficulty,
  mode
}) => {
  const navigate = useNavigate();

  // Use colorBank from props, fallback to default if missing
  const defaultColors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#95E1D3", // Mint
  ];

  const colors = colorBank && colorBank.length > 0 ? colorBank.map((c) => {
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

  const [phase, setPhase] = useState("memorize"); // memorize, play, gameover
  const [timer, setTimer] = useState(timeLimit || 10);
  const [playTimer, setPlayTimer] = useState(playTimeLimit || 15);
  const [fills, setFills] = useState({}); // Changed from userGrid to fills
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorGrid, setShowColorGrid] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [svgRegionCount, setSvgRegionCount] = useState(gridSize * gridSize); // Track actual region count
  const [showMeme, setShowMeme] = useState(false);
  const [serverScore, setServerScore] = useState(null);
  const [serverAccuracy, setServerAccuracy] = useState(null);

  const [timeRanOut, setTimeRanOut] = useState(false); // Track if time ran out

  const playIntervalRef = useRef(null);

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
      setPlayTimer(playTimeLimit || 15);
    }
  }, [phase, timer, playTimeLimit]);

  // Play phase timer with pause logic
  useEffect(() => {
    if (phase === "play" && playTimer > 0 && !isPaused) {
      playIntervalRef.current = setInterval(() => {
        setPlayTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(playIntervalRef.current);
    } else if (phase === "play" && (isPaused || playTimer === 0)) {
      clearInterval(playIntervalRef.current);
      if (playTimer === 0) {
        setTimeRanOut(true);
        setPhase("gameover");
      }
    }
    return () => clearInterval(playIntervalRef.current);
  }, [phase, playTimer, isPaused]);

  // Callback to receive fills from DrawingGrid
  const handleFillsChange = (newFills) => {
    setFills(newFills);
    // Update region count based on actual fills
    const regionCount = Object.keys(newFills).length;
    if (regionCount > 0) {
      setSvgRegionCount(regionCount);
    }
  };

  const handleColorPaletteClick = (color) => {
    setSelectedColor(selectedColor === color ? null : color);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleRestart = () => {
    setIsPaused(false);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleReady = () => {
    // skip remaining memorization time and move to play phase
    setShowColorGrid(false);
    setPhase("play");
    setPlayTimer(playTimeLimit || 15);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getResultMessage = () => {
    // tailor thresholds however you want
    if (percentage >= 90) return "Pure Genius!";
    if (percentage >= 70) return "Great job!";
    if (percentage >= 50) return "Not bad!";
    return "Try again...?";
  };


  // Check if all regions are filled
  const isGridFull = Object.keys(fills).length === svgRegionCount &&
    Object.values(fills).every((color) => color !== null);

  // Calculate score based on fills object and actual SVG regions
  const calculateScore = () => {
    let correctMatches = 0;

    // Count matches based on actual filled regions
    Object.keys(fills).forEach((id) => {
      const expected = correctPattern[id];
      const userColor = fills[id];

      if (userColor && expected && getColorHex(userColor) === getColorHex(expected)) {
        correctMatches++;
      }
    });

    const percentage = Math.round((correctMatches / svgRegionCount) * 100);
    // Calculate points for grid mode with difficulty multipliers

    let points = 0;
    if (mode === "grid") {
      const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
      }[difficulty] || 1;
      points = Math.round(percentage * difficultyMultiplier);
    }

    return { correctMatches, percentage, points };
  };


  const { correctMatches, percentage, points } = calculateScore();

  // Create grid style based on gridSize
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gap: "8px",
  };


  // select a random drawing from our drawings folder
  const SVG_PATHS = [
    "/drawings/bear.svg",
    "/drawings/snake.svg",
    "/drawings/apple.svg",
    "/drawings/pug.svg",
    // add the paths once more photos come in
  ];

  const [svgPath] = useState(() => {
    if (mode === "drawing") {
      return SVG_PATHS[Math.floor(Math.random() * SVG_PATHS.length)];
    }
    return null; // Use regular grid for grid mode
  });


  const normalizedPattern = {};
  for (const [k, v] of Object.entries(fills)) {
    normalizedPattern[k] = getColorName(v);
  }


  // submit scores to backend
  const submittedRef = useRef(false);

  useEffect(() => {
    if (phase !== "gameover") return;

    const isSixtySeven = percentage === 67 || correctMatches === 67;
    if (!isSixtySeven) return;

    const timer = setTimeout(() => {
      setShowMeme(true);
    }, 1800); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, [phase, percentage, correctMatches]);

  useEffect(() => {
    if (phase !== "gameover") return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    // time taken in seconds
    const totalPlay = playTimeLimit || 15;
    const timeTaken = totalPlay - playTimer;

    // IMPORTANT: gameId must be real (created from backend)
    if (!gameId) {
      console.warn("No gameId, cannot submit game.");
      return;
    }


    post("/api/game/submit", {
      gameId,
      userPattern: normalizedPattern,
      timeTaken,
    })
      .then((res) => {
        setServerScore(res.score);
        setServerAccuracy(res.accuracy);
      })
      .catch((err) => {
        console.error("Failed to submit game:", err);
      });

  }, [phase, gameId, fills, playTimer, playTimeLimit]);




  return (
    <div className="color-grid-wrapper">
      <button
        className="game-logo-button"
        onClick={handleGoHome}
        aria-label="Go to home page"
      >
        <img
          src="/paint_bucket.png"
          alt="PALETTE Logo"
          className="game-logo"
        />
      </button>

      <div className="timer-score-wrapper">
        {(phase === "memorize" || phase === "play") && (
          <div className="timer-display">
            {phase === "memorize" ? timer : playTimer}s
          </div>
        )}
        {phase === "gameover" && (
          <div className="score-details">
            <div className="score-title">Your Score</div>
            {mode === "grid" ? (
              <>
                <div className="score-percentage">{points}</div>
                <div className="score-matches">
                  {correctMatches} out of {svgRegionCount} correct
                </div>
              </>
            ) : (
              <>
                <div className="score-percentage">{percentage}%</div>
                <div className="score-matches">
                  {correctMatches} out of {svgRegionCount} correct
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Memorize Phase - Show colored drawing */}
      {phase === "memorize" && showColorGrid && (
        <div className="color-grid-container">
          <div className="phase-title">Memorize the colors!</div>
          {mode === "grid" ? (
            <div className="grid-container" style={gridStyle}>
              {Array.from({ length: gridSize * gridSize }, (_, index) => (
                <div
                  key={index}
                  className="grid-square hoverable"
                  style={{ backgroundColor: getColorHex(correctPattern[index.toString()]) }}
                />
              ))}
            </div>
          ) : (
            <DrawingGrid
              selectedColor={null}
              correctPattern={correctPattern}
              onFillsChange={() => { }} // No interaction during memorization
              isPaused={true}
              gridSize={gridSize}
              svgPath={svgPath}
              showCorrectColors={true} // Show the correct colors during memorization
            />
          )}
          <button className="ready-btn" onClick={handleReady}>
            Ready
          </button>
        </div>
      )}

      {/* Play Phase - Grid and palette */}
      {phase === "play" && (
        <div className="play-phase-container">
          <div className="phase-title">Fill the grid!</div>

          <div className="play-content-wrapper">
            {/* DrawingGrid component */}
            <div className="color-grid-container">
              {mode === "grid" ? (
                <div className="grid-container" style={gridStyle}>
                  {Array.from({ length: gridSize * gridSize }, (_, index) => {
                    const id = index.toString();
                    return (
                      <div
                        key={index}
                        className="grid-square clickable"
                        style={{ backgroundColor: fills[id] ? getColorHex(fills[id]) : "#f5f5f5" }}
                        onClick={() => {
                          if (!isPaused && selectedColor) {
                            const colorName = getColorName(selectedColor);
                            setFills(prev => ({ ...prev, [id]: colorName }));
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <DrawingGrid
                  selectedColor={selectedColor}
                  correctPattern={correctPattern}
                  onFillsChange={handleFillsChange}
                  isPaused={isPaused}
                  gridSize={gridSize}
                  svgPath={svgPath}
                  showCorrectColors={false}
                />
              )}
            </div>

            {/* Color palette */}
            <div className="palette-wrapper">
              <div className={`color-palette ${difficulty ? `difficulty-${difficulty}` : ""}`}>
                <div className="palette-grid">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className={`palette-color ${selectedColor === color ? "selected" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => !isPaused && handleColorPaletteClick(color)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Done button appears when all squares are filled and not paused */}
          {isGridFull && !isPaused && (
            <button className="done-btn" onClick={() => {
              setTimeRanOut(false);
              setPhase("gameover");
            }}>
              Done
            </button>
          )}
        </div>
      )}

      {/* Game Over Phase */}
      {phase === "gameover" && (
        <div className="gameover-container">



          {showMeme && (
            <div className="meme-overlay" onClick={() => setShowMeme(false)}>
              <div className="meme-modal" onClick={(e) => e.stopPropagation()}>
                <div className="meme-title">Nice! You just scored 67</div>

                <img
                  className="meme-img"
                  src="/six_seven.gif"
                  alt="67 meme"
                />

                <button className="meme-close" onClick={() => setShowMeme(false)}>
                  Close
                </button>
              </div>
            </div>
          )}


          <div className="result-title">{getResultMessage()}</div>

          <div className="comparison-container">
            {/* Original Drawing */}
            <div className="comparison-section">
              <div className="comparison-label">Original</div>
              {mode === "grid" ? (
                <div className="grid-container" style={gridStyle}>
                  {Array.from({ length: gridSize * gridSize }, (_, index) => (
                    <div
                      key={index}
                      className="grid-square"
                      style={{ backgroundColor: getColorHex(correctPattern[index.toString()]) }}
                    />
                  ))}
                </div>
              ) : (
                <DrawingGrid
                  selectedColor={null}
                  correctPattern={correctPattern}
                  onFillsChange={() => { }}
                  isPaused={true}
                  gridSize={gridSize}
                  svgPath={svgPath}
                  showCorrectColors={true}
                />
              )}
            </div>

            {/* User's Drawing */}
            <div className="comparison-section">
              <div className="comparison-label">Your Input</div>
              {mode === "grid" ? (
                <div className="grid-container" style={gridStyle}>
                  {Array.from({ length: gridSize * gridSize }, (_, index) => {
                    const id = index.toString();
                    return (
                      <div
                        key={index}
                        className="grid-square"
                        style={{ backgroundColor: fills[id] ? getColorHex(fills[id]) : "#f5f5f5" }}
                      />
                    );
                  })}
                </div>
              ) : (
                <DrawingGrid
                  selectedColor={null}
                  correctPattern={correctPattern}
                  onFillsChange={() => { }}
                  isPaused={true}
                  gridSize={gridSize}
                  svgPath={svgPath}
                  showCorrectColors={false}
                  prefilledColors={fills}
                />
              )}
            </div>
          </div>

          {/* <div className="score-details">
           <div className="score-title">Your Score</div>
           {mode === "grid" ? (
             <>
               <div className="score-percentage">{serverScore}</div>
               <div className="score-matches">
                 {correctMatches} out of {svgRegionCount} correct
               </div>
             </>
           ) : (
             <>
               <div className="score-percentage">{(serverAccuracy ?? percentage)}%</div>
               <div className="score-matches">
                 {correctMatches} out of {svgRegionCount} correct
               </div>
             </>
           )}
         </div> */}

          <div className="button-group">
            <button className="play-again-btn" onClick={() => window.location.href = "/"}>
              Play Again
            </button>

            <button className="play-again-btn" onClick={() => navigate("/leaderboard", { state: { mode } })}>
              Leaderboard
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default ColorGrid;
