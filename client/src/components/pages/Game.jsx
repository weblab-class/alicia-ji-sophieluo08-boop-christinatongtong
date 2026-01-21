import React from "react";
import ColorGrid from "../modules/ColorGrid";
import "./Game.css";

const Game = () => {
  console.log("Game component rendering");
  return (
    <div className="game-container">
      <h1>Game</h1>
      <ColorGrid />
    </div>
  );
};

export default Game;
