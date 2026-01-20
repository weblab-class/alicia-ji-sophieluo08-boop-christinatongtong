import ScoreDisplay from "./ScoreDisplay";

function Feedback({ score }) {
    if (score >= 100) {
        return <p>Pure Genius!</p>;
    } else if (score >= 70) {
        return <p>Decent Job!</p>;
    } else {
        return <p>Try Again Maybe</p>;
    }
}

function GameResult({ score, accuracy, time, onPlayAgain }) {

    const feedback = Feedback(score);

  return (
    <div className="game-result">
        <h1>GAME OVER</h1>
        <h2 className="feedback">{feedback}</h2>
        <ScoreDisplay score={score} accuracy={accuracy} time={time} />

        <div className="button-container">
            <button className="result-button play-again-button" onClick={onPlayAgain}>
                Play Again
            </button>

            {/* TODO: Add "onLeaderboard" function later */}
            <button className="result-button leaderboard-button">
                Leaderboard
            </button>
        </div>

    </div>
  );
};

export default GameResult;
