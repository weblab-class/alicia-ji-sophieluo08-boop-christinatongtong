import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate("/game");
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="app-title">FILL</h1>
        <button className="play-button" onClick={handlePlayClick}>
          Play!
        </button>
      </div>
    </div>
  );
};

export default Home;
