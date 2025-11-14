import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

import PlayerRegistration from './PlayerRegistration';

const Home = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="home futuristic-home">
      {/* New futuristic dashboard-style landing — hero banner removed */}
      <header className="dash-header container-wide">
        <div className="dash-title">
          <h1 className="neon-title">Sankalp Premier League</h1>
          <p className="muted">A modern reimagining of the league experience — neon stats &amp; instant actions</p>
        </div>
        <div className="dash-actions">
          <button className="btn btn-ghost" onClick={() => setShowRegistration(true)}>Quick Register</button>
          <Link to="/live-auction-public" className="btn btn-primary">Enter Auction</Link>
        </div>
      </header>

      <main className="container-wide dashboard-grid">
        <section className="panel cards-grid">
          <article className="neon-card">
            <div className="card-head">
              <div className="card-icon">📊</div>
              <h3>Live Scores</h3>
            </div>
            <div className="card-body">
              <p className="muted">No matches active</p>
            </div>
          </article>

          <article className="neon-card">
            <div className="card-head">
              <div className="card-icon">�</div>
              <h3>Teams</h3>
            </div>
            <div className="card-body">
              <p className="muted">6 teams registered</p>
            </div>
          </article>

          <article className="neon-card neon-highlight">
            <div className="card-head">
              <div className="card-icon">📝</div>
              <h3>Player Registration</h3>
            </div>
            <div className="card-body">
              <p className="muted">Join the league — open now</p>
              <div className="card-cta">
                <button className="btn btn-accent" onClick={() => setShowRegistration(true)}>Register</button>
              </div>
            </div>
          </article>

          <article className="neon-card">
            <div className="card-head">
              <div className="card-icon">�</div>
              <h3>Schedule</h3>
            </div>
            <div className="card-body">
              <p className="muted">View upcoming matches</p>
              <Link to="/schedule" className="link-inline">Open Schedule →</Link>
            </div>
          </article>
        </section>

        <aside className="panel live-panel">
          <h4 className="section-sub">Live Feed</h4>
          <div className="live-content">
            <p className="muted">No live feed — follow the auction for updates.</p>
          </div>
          <div className="section-sub">Sponsors</div>
          <div className="sponsors-row">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sponsor-pill">Sponsor {i + 1}</div>
            ))}
          </div>
        </aside>
      </main>

      {showRegistration && (
        <PlayerRegistration onClose={() => setShowRegistration(false)} />
      )}

      <footer className="home-footer futuristic-footer">
        <div className="container-wide footer-inner">
          <div>© {new Date().getFullYear()} Sankalp Premier League</div>
          <div className="footer-links">
            <button className="footer-link" onClick={() => setShowPrivacy(true)}>Privacy</button>
            <button className="footer-link" onClick={() => setShowTerms(true)}>Terms</button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <button className="close-btn" onClick={() => setShowPrivacy(false)}>×</button>
            <h2>Privacy Policy</h2>
            <p className="muted">Short form policy — contact the organizer for full details.</p>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <button className="close-btn" onClick={() => setShowTerms(false)}>×</button>
            <h2>Terms & Conditions</h2>
            <p className="muted">Short form T&amp;C — see full text on request.</p>
          </div>
        </div>
      )}

      {/* Contact Support Bar */}
      <div className="contact-support-bar">
        <div className="support-content">
          <div className="support-icon">📞</div>
          <div className="support-text">
            <h4>Need Help or Support?</h4>
            <div className="contact-details">
              <span className="contact-item">
                <strong>JEET:</strong> <a href="tel:9833232395">9833232395</a>
              </span>
              <span className="contact-separator">|</span>
              <span className="contact-item">
                <strong>RISHABH:</strong> <a href="tel:9967061814">9967061814</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;