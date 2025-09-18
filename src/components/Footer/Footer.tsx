import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Moroccan Court Kings</h3>
            <p>Premier basketball tournament management system</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/tournament">Tournament</a></li>
              <li><a href="/players">Players</a></li>
              <li><a href="/schedule">Schedule</a></li>
              <li><a href="/games">Games</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Need help? Contact the tournament organizers</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Moroccan Court Kings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
