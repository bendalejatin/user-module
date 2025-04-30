import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logo from "../Assets/logo.jpg";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-logo">
        <img src={logo} alt="App Logo" />
      </div>
      <h1 className="splash-title">Welcome to EntryKart !</h1>
      <p className="splash-subtext">Getting things ready for you...</p>
      <div className="loader"></div>
    </div>
  );
};

export default SplashScreen;
