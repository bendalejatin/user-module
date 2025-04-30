import React, { useState } from "react";
// import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-logo">Entry Kart</div>

      {/* <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/event-details" onClick={() => setMenuOpen(false)}>Event Details</Link></li>
        <li><Link to="/my-coupons" onClick={() => setMenuOpen(false)}>My Coupons</Link></li>
        <li><Link to="/maintenance" onClick={() => setMenuOpen(false)}>Maintenance</Link></li>
        <li><Link to="/Entry-permission" onClick={() => setMenuOpen(false)}>Entry-Permissions</Link></li>
        <li><Link to="/my-profile" onClick={() => setMenuOpen(false)}>My Profile</Link></li>
        <li><Link to="/" className="logout-link" onClick={() => setMenuOpen(false)}>Logout</Link></li>
      </div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div> */}
    </nav>
  );
};

export default Navbar;
