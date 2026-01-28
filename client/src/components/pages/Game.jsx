import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ColorGrid from "../modules/ColorGrid";
import { post } from "../../utilities";
import { UserContext } from "../App";
import "./Game.css";

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // get difficulty data from navigation state
  const difficultyData = location.state;

  useEffect(() => {
    // check if user is logged in first
    if (!userId) {
      setError("Please log in to play the game.");
      setLoading(false);
      return;
    }

    // if no difficulty data, redirect to home page
    if (!difficultyData) {
      navigate("/");
      return;
    }

    // create game via API
    const createGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await post("/api/game/create", {
          gridSize: difficultyData.gridSize,
          difficulty: difficultyData.difficulty,
          mode: difficultyData.mode || "grid",
        });
        setGameData(response);
      } catch (err) {
        const errStr = String(err);
        if (errStr.includes("ECONNREFUSED") || errStr.includes("Failed to fetch")) {
          setError("Cannot connect to server. Please make sure the server is running.");
        } else if (errStr.includes("401") || errStr.includes("403")) {
          setError("Authentication required. Please log in to play.");
        } else if (errStr.includes("404")) {
          setError("Game creation endpoint not found (404). Server may not be running properly.");
        } else if (errStr.includes("400")) {
          setError("Invalid game parameters. Please try selecting a difficulty again.");
        } else {
          setError(`Failed to create game: ${errStr}`);
        }
      } finally {
        setLoading(false);
      }
    };

    createGame();
  }, [difficultyData, navigate, userId]);

  if (loading) {
    return (
      <div className="game-container">
        <div className="loading-message">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="game-container">
        <div className="loading-message">No game data available</div>
      </div>
    );
  }

  // Generate hardcoded pattern if not provided by API (for testing)
  const generateHardcodedPattern = (gridSize, colorBank) => {
    const pattern = {};
    const totalSquares = gridSize * gridSize;
    for (let i = 0; i < totalSquares; i++) {
      // Randomly assign a color from the color bank
      const randomColor = colorBank[Math.floor(Math.random() * colorBank.length)];
      pattern[i.toString()] = randomColor;
    }
    return pattern;
  };

  // Use correctPattern from API, or generate hardcoded one for testing
  const correctPattern = gameData.correctPattern || generateHardcodedPattern(gameData.gridSize, gameData.colorBank);

  const playTimeLimit = difficultyData.mode === "drawing" ? 30 : gameData.playTimeLimit;

  return (
    <div className="game-container">
      <ColorGrid
        gameId={gameData.gameId}
        gridSize={gameData.gridSize}
        timeLimit={gameData.timeLimit}
        playTimeLimit={playTimeLimit}
        colorBank={gameData.colorBank}
        correctPattern={correctPattern}
        difficulty={gameData.difficulty}
        mode={difficultyData.mode}
      />
    </div>
  );
};

export default Game;
