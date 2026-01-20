export default function Profile({ name, email, score }) {
    return (
      <div>
        <h1>Profile</h1>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Best Score: {score}</p>
      </div>
    );
  }
