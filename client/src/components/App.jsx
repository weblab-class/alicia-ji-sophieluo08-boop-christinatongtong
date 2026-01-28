import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";
import HamburgerMenu from "./modules/HamburgerMenu";

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
            // Failed to initialize socket
          });
        }
      })
      .catch((error) => {
        alert("Login failed. Please try again.");
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
      <HamburgerMenu />
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;
