import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './CreateAccount.css';

interface CreateAccountFormData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email: string;
  phone: string;
  age: string;
}

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAccountFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    age: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = (): string | null => {
    if (!formData.username.trim()) return 'Username is required';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter a valid email';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.age.trim()) return 'Age is required';
    if (parseInt(formData.age) < 16 || parseInt(formData.age) > 50) return 'Age must be between 16 and 50';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the user account
      await authService.createUser(formData.username, formData.password, 'player');
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please log in with your credentials.',
            username: formData.username 
          }
        });
      }, 2000);

    } catch (error: any) {
      console.error('Account creation error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="create-account">
        <div className="create-account-hero">
          <div className="container">
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h1 className="success-title sahara-scrolls">Welcome to MCK!</h1>
              <p className="success-text montserrat">
                Your player account has been created successfully. You'll be redirected to the login page shortly.
              </p>
              <div className="success-loader">
                <div className="spinner"></div>
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TEMPORARILY HIDDEN - No active tournaments
  const isRegistrationActive = false;

  if (!isRegistrationActive) {
    return (
      <div className="create-account">
        <div className="create-account-hero">
          <div className="container">
            <div className="back-to-home">
              <Link to="/" className="back-link montserrat white-text">
                <span className="back-arrow">←</span>
                Back to Home
              </Link>
            </div>
            <div style={{ textAlign: 'center', padding: '4rem 0', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 className="create-account-title sahara-scrolls" style={{ marginBottom: '2rem' }}>
                Tournament Registration Closed
              </h1>
              <p className="create-account-subtitle montserrat" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                There are no current tournaments available for registration.
              </p>
              <p className="montserrat" style={{ color: '#efefef', fontSize: '1rem' }}>
                Please check back later or contact us for more information about upcoming tournaments.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-account" style={{ display: 'none' }}>
      <div className="create-account-hero">
        <div className="container">
          <div className="back-to-home">
            <Link to="/" className="back-link montserrat">
              <span className="back-arrow">←</span>
              Back to Home
            </Link>
          </div>
          <h1 className="create-account-title sahara-scrolls">Join the Court Kings</h1>
          <p className="create-account-subtitle montserrat">
            Create your player account to participate in MCK tournaments
          </p>
        </div>
      </div>

      <div className="create-account-content">
        <div className="container">
          <div className="account-form-section">
            <form className="create-account-form" onSubmit={handleSubmit}>
              <h2 className="form-title sahara-scrolls">Player Registration</h2>
              
              {error && (
                <div className="form-message error">
                  <div className="message-icon">❌</div>
                  <p>{error}</p>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label montserrat">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input montserrat"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age" className="form-label montserrat">
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="form-input montserrat"
                    placeholder="Your age"
                    min="16"
                    max="50"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label montserrat">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input montserrat"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label montserrat">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input montserrat"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username" className="form-label montserrat">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input montserrat"
                  placeholder="Choose a unique username"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password" className="form-label montserrat">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input montserrat"
                    placeholder="Create a secure password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label montserrat">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input montserrat"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <div className="form-info">
                <div className="info-box">
                  <h4 className="sahara-scrolls">Player Account Benefits:</h4>
                  <ul className="benefits-list montserrat">
                    <li>View your assigned games and tournaments</li>
                    <li>Update your personal information</li>
                    <li>Access your tournament history</li>
                    <li>Receive tournament notifications</li>
                  </ul>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary montserrat"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <span className="spinner"></span>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Player Account'
                  )}
                </button>
                
                <p className="login-link montserrat">
                  Already have an account? <Link to="/login">Sign in here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
