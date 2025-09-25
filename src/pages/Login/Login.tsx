import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TEMPORARILY HIDDEN - No active tournaments
  const isRegistrationActive = false;

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      // Redirect based on user role after successful login
      if (user.role === 'player') {
        navigate('/player-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">        
        <div className="login-header">
          <div className="login-logo">
            <img src="/mckLogo.png" alt="MCK Logo" className="logo-icon" />
          </div>
          <p>Sign in to manage your tournament</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {isRegistrationActive && (
          <div className="login-footer">
            <div className="divider">
              <span>New Player?</span>
            </div>
            <Link to="/create-account" className="create-account-button">
              Create Player Account
            </Link>
            <p className="login-note">
              Join the MCK community and participate in tournaments
            </p>
          </div>
        )}
      <div className="back-to-home">
          <Link to="/" className="back-link montserrat">
            <span className="back-arrow">←</span>
            Back to Home
          </Link>
        </div>
      </div>



      <div className="login-background">
        <div className="basketball-animation">
          <div className="basketball bounce">
            <img src="/mckIcon.png" alt="logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
