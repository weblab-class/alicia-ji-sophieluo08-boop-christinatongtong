import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";

import jwt_decode from "jwt-decode";

import "../utilities.css";

import { socket } from "../client-socket";

import { get, post } from "../utilities";

export const UserContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    post("/api/login", { token: userToken })
      .then((user) => {
        if (user && user._id) {
          setUserId(user._id);
          post("/api/initsocket", { socketid: socket.id }).catch((err) => {
            console.error("Failed to initialize socket:", err);
          });
        } else {
          console.error("Login response missing user._id:", user);
        }
      })
      .catch((error) => {
        console.error("Login API error:", error);
        alert("Login failed. Please check console for details.");
      });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    handleLogin,
    handleLogout,
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;
