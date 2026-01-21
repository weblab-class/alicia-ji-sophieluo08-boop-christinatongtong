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


    if (!difficultyData) {
      console.log("No difficulty data, redirecting to home");
      navigate("/", { replace: true });
      return;
    }

    // create game via API
    const createGame = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Creating game with:", {
          gridSize: difficultyData.gridSize,
          difficulty: difficultyData.difficulty,
        });

        const response = await post("/api/game/create", {
          gridSize: difficultyData.gridSize,
          difficulty: difficultyData.difficulty,
        });

        console.log("Game created successfully:", response);
        console.log("Response keys:", Object.keys(response || {}));

        if (!response || !response.gameId) {
          throw new Error("Invalid game response: missing gameId");
        }
        if (!response.gridSize) {
          throw new Error("Invalid game response: missing gridSize");
        }
        if (!response.correctPattern) {
          throw new Error("Invalid game response: missing correctPattern");
        }

        setGameData(response);
        console.log("Game data set successfully");
      } catch (err) {
        console.error("Error creating game:", err);
        console.error("Error type:", typeof err);
        console.error("Error keys:", Object.keys(err || {}));
        console.error("Full error:", JSON.stringify(err, null, 2));

        // error messages for debugging
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

  if (!difficultyData) {
    return (
      <div className="game-container">
        <div className="loading-message">Redirecting to home...</div>
      </div>
    );
  }

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
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  console.log("Game data:", gameData);

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

  return (
    <div className="game-container">
      <ColorGrid
        gameId={gameData.gameId}
        gridSize={gameData.gridSize}
        timeLimit={gameData.timeLimit}
        colorBank={gameData.colorBank}
        correctPattern={correctPattern}
        difficulty={gameData.difficulty}
      />
    </div>
  );
};

export default Game;
