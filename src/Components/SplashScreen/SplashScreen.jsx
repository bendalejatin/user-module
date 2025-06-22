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
      <div className="splash-content">
        <h1 className="splash-title">MySocietyMate</h1>
        <p className="splash-subtext">Getting things ready for you...</p>
        <p className="splash-wait-text">Please wait while we prepare your experience</p>
      </div>
    </div>

  );

};

export default SplashScreen;
