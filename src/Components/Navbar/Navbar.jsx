import React from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";
import ProfileIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const location = useLocation();

  // Map routes to their respective titles
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "MySocietyMate";
      case "/broadcast-messages":
        return "Messages";
      case "/event-details":
        return "Events";
      case "/maintenance":
        return "Maintenance";
      case "/entry-permission":
        return (
          <>
            Entry Permission
            <span className="nav-subtitle">Visitor Access Management</span>
          </>
        );
      case "/my-coupons":
        return "My Coupons";
      case "/my-profile":
        return "My Profile";
      case "/service-entries":
        return "Service Entries";
      case "/neighbor-details":
        return "Neighbor Details";
      case "/add-vehicle":
        return "Add Vehicle";
      case "/":
        return "Login";
      case "/splash":
        return "Splash";
      default:
        return "MySocietyMate"; // Fallback title
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">{getPageTitle()}</div>
      <div className="Profile" onClick={() => (window.location.href = "/my-profile")}>
        <ProfileIcon className="profile-icon" />
        {/* <p>Profile</p> */}
      </div>
    </nav>
  );
};

export default Navbar;