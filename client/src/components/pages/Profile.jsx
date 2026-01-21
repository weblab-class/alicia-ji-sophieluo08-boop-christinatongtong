export default function Profile({ name, email, bestScore }) {
    return (
      <div>
        <h1>Profile</h1>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Best Score: {bestScore}</p>
      </div>
    );
  }
