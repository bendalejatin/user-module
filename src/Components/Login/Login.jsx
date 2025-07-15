import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VisibilityIcon from '@mui/icons-material/Visibility';
import login from "../Assets/loginlogo.jpg";
import "./Login.css";

// const BASE_URL = "http://localhost:5000"; // Adjust this to your backend URL
const BASE_URL = "https://dec-entrykart-backend.onrender.com" ; // deployment url

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("Email and password are required");
      return;
    }

    if (!rememberMe) {
      setMessage('Please check the "Remember me" checkbox to continue.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, {
        email,
        password,
      });

      localStorage.removeItem("ownerEmail");
      localStorage.setItem("ownerEmail", email);

      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token);
      navigate("/splash", { replace: true });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <h1>MySocietyMate</h1>
        </div>
        <div className="login-box">
          <div className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter a valid email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <VisibilityIcon
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                  onClick={togglePasswordVisibility}
                />
              </div>
            </div>
            <div className="login-options">
              <div>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember"> Remember me</label>
              </div>
            </div>
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
            {message && <p className="error-message">{message}</p>}
            <p className="register-link">
              Forgot your password?{" "}
              <span onClick={() => navigate("/signup")}>Reset it here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;