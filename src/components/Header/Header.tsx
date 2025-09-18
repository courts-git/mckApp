import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {currentUser?.role !== 'player' && (
          <div className="logo">
            <Link to={"/dashboard"}>
              <img src="/mckLogo.png" alt="MCK Logo" className="logo-image" />
              <span className="logo-text">MCK</span>
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {currentUser && (
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={handleMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        {currentUser && (
          <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && <div className="mobile-overlay" onClick={handleOverlayClick}></div>}

            <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul className="nav-list">
                {currentUser?.role !== 'player' && (
                  <li className="nav-item">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={handleNavClick}>
                      Dashboard
                    </Link>
                  </li>
                )}
                {currentUser?.role !== 'player' && (
                  <li className="nav-item">
                    <Link to="/players" className={`nav-link ${isActive('/players')}`} onClick={handleNavClick}>
                      Players
                    </Link>
                  </li>
                )}
                {currentUser?.role !== 'player' && (
                  <li className="nav-item">
                    <Link to="/games" className={`nav-link ${isActive('/games')}`} onClick={handleNavClick}>
                      Games
                    </Link>
                  </li>
                )}
                {currentUser?.role !== 'player' && (
                  <li className="nav-item">
                    <Link to="/schedule" className={`nav-link ${isActive('/schedule')}`} onClick={handleNavClick}>
                      Schedule
                    </Link>
                  </li>
                )}
                {currentUser?.role === 'player' && (
                  <li className="nav-item">
                    <Link to="/my-games" className={`nav-link ${isActive('/my-games')}`} onClick={handleNavClick}>
                      My Games
                    </Link>
                  </li>
                )}
                {currentUser?.role === 'player' && (
                  <li className="nav-item">
                    <Link to="/my-tournaments" className={`nav-link ${isActive('/my-tournaments')}`} onClick={handleNavClick}>
                      My Tournaments
                    </Link>
                  </li>
                )}
                {authService.hasRole(currentUser, 'admin') && (
                  <li className="nav-item">
                    <Link to="/tournaments" className={`nav-link ${isActive('/tournaments')}`} onClick={handleNavClick}>
                      Tournaments
                    </Link>
                  </li>
                )}
                {authService.hasRole(currentUser, 'admin') && (
                  <li className="nav-item">
                    <Link to="/users" className={`nav-link ${isActive('/users')}`} onClick={handleNavClick}>
                      Users
                    </Link>
                  </li>
                )}
                {currentUser?.role === 'player' && (
                  <li className="nav-item">
                    <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={handleNavClick}>
                      My Profile
                    </Link>
                  </li>
                )}

                {/* Mobile User Info */}
                <li>
                  <div className="mobile-user-info">
                    <button className="mobile-logout-btn" onClick={handleLogout}>
                      <span className="logout-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;