import React from 'react';
import { Link } from 'react-router-dom';
import './AccessDenied.css';

interface AccessDeniedProps {
  requiredRole: string;
  userRole: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole, userRole }) => {
  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <div className="access-denied-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>
          You don't have permission to access this page. 
          This page requires <strong>{requiredRole}</strong> role, 
          but you have <strong>{userRole}</strong> role.
        </p>
        <div className="access-denied-actions">
          {userRole === "player" ? (
            <Link to="/my-games" className="btn btn-primary">
              Back to My Games
            </Link>
          ) : (
            <><Link to="/dashboard" className="btn btn-primary">
                Back to Dashboard
              </Link><Link to="/" className="btn btn-secondary">
                  Go Home
                </Link></>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
