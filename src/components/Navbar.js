import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo">
          <img src="/spl.jpg" alt="SPL Logo" className="navbar-logo-img" />
        </div>
        <h1 className="navbar-title">Sankalp Premier League</h1>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about-us" className="nav-link">About Us</Link>
        <Link to="/watch-live" className="nav-link">Watch Live</Link>
        <Link to="/latest-news" className="nav-link">Latest News</Link>
        <Link to="/scoring" className="nav-link">Scoring</Link>
        <Link to="/schedule" className="nav-link">Schedule</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </div>
    </nav>
  );
};

export default Navbar; 