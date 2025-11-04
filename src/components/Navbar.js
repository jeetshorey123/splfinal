import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

// Simplified, mobile-friendly navbar with a top registration link.
const Navbar = () => {
  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">Sankalp Premier League</div>
          <div className="topbar-right">
            <Link to="/register" className="register-link">Register</Link>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo">
            <img src="/spl.jpg" alt="SPL Logo" className="navbar-logo-img" />
          </div>
          <h1 className="navbar-title">Sankalp Premier League</h1>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about-us" className="nav-link">About</Link>
          <Link to="/watch-live" className="nav-link">Live</Link>
          <Link to="/latest-news" className="nav-link">News</Link>
          <Link to="/scoring" className="nav-link">Scoring</Link>
          <Link to="/schedule" className="nav-link">Schedule</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;