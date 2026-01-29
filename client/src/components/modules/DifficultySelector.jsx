import React, { useState } from "react";
import "./DifficultySelector.css";

const DifficultySelector = ({ onDifficultySelect }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const difficulties = [
    {
      id: "easy",
      name: "Easy",
      gridSize: 3,
      timeLimit: 15,
      description: "3×3 grid, 15s, max 300",
      colorBank: 2,
    },
    {
      id: "medium",
      name: "Medium",
      gridSize: 3,
      timeLimit: 30,
      description: "3×3 grid, 30s, max 600",
      colorBank: 3,
    },
    {
      id: "hard",
      name: "Hard",
      gridSize: 4,
      timeLimit: 40,
      description: "4×4 grid, 40s, max 1000",
      colorBank: 4,
    },
  ];

  const handleSelect = (difficulty) => {
    setSelectedDifficulty(difficulty.id);
    if (onDifficultySelect) {
      onDifficultySelect({
        difficulty: difficulty.id,
        gridSize: difficulty.gridSize,
        timeLimit: difficulty.timeLimit,
      });
    }
  };

  return (
    <div className="difficulty-selector">
      <h2 className="difficulty-title">Select Difficulty</h2>
      <div className="difficulty-options">
        {difficulties.map((difficulty) => (
          <div
            key={difficulty.id}
            className={`difficulty-card ${selectedDifficulty === difficulty.id ? "selected" : ""
              }`}
            onClick={() => handleSelect(difficulty)}
          >
            <div className="difficulty-name">{difficulty.name}</div>
            <div className="difficulty-details">
              <div className="detail-item">
                <span className="detail-label">Grid:</span>
                <span className="detail-value">{difficulty.gridSize}×{difficulty.gridSize}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{difficulty.timeLimit}s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Colors:</span>
                <span className="detail-value">{difficulty.colorBank}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
