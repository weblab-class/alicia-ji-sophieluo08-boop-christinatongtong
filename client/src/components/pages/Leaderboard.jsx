import HamburgerMenu from "../modules/HamburgerMenu";

export default function Leaderboard({ }) {
    return (
      <div>
        <HamburgerMenu />
        <h1>Leaderboard</h1>
        <p>No. 1: {Alicia}</p>
        <p>No. 2: {Christina}</p>
        <p>No. 3: {Sophie}</p>
      </div>
    );
  }
