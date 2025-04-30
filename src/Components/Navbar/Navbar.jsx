import React from "react";
// import { Link } from "react-router-dom";
import "./Navbar.css";
import ProfileIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {

  return (
    <nav className="navbar">
      <div className="nav-logo">My Society Mate</div>
      
      <div className="Profile" onClick={() => window.location.href = "/my-profile"}>
        <ProfileIcon className="profile-icon" />
        <p>Profile</p>
      </div> 
    </nav>
  );
};

export default Navbar;
