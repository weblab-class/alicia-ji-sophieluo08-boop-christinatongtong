// import "./scoreDisplay.css";

export default function ScoreDisplay({ score, accuracy, time }) {
  return (
    <div className="score-display">
      <div className="score-item">
        <span className="label">Your Overall Score</span>
        <span className="value">{score}</span>
      </div>

      <div className="score-item">
        <span className="label">Accuracy</span>
        <span className="value">{accuracy}%</span>
      </div>

      <div className="score-item">
        <span className="label">Time</span>
        <span className="value">{time}s</span>
      </div>
    </div>
  );
}
