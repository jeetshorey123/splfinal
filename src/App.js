import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import WatchLive from './components/WatchLive';
import LatestNews from './components/LatestNews';
import LiveAuction from './components/LiveAuction';
import LiveAuctionPublic from './components/LiveAuctionPublic';
import ScoreBoard from './components/ScoreBoard';
import Squads from './components/Squads';
import Scoring from './components/Scoring';
import Schedule from './components/Schedule';
import Admin from './components/Admin';
import RegisterPage from './components/RegisterPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/watch-live" element={<WatchLive />} />
          <Route path="/latest-news" element={<LatestNews />} />
          <Route path="/live-auction" element={<LiveAuction />} />
          <Route path="/live-auction-public" element={<LiveAuctionPublic />} />
          <Route path="/score-board" element={<ScoreBoard />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/scoring" element={<Scoring />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
