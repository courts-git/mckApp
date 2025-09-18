import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { usersService } from '../../services/firebaseService';
import './Users.css';

interface UserDisplay {
  id: string;
  username: string;
  role: 'admin' | 'comando';
}

const Users: React.FC = () => {
  // const { } = useAuth(); // Removed unused destructuring
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'comando' as 'admin' | 'comando'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await usersService.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setShowCreateForm(true);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'comando'
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await authService.createUser(formData.username, formData.password, formData.role);
      
      setSuccess('User created successfully!');
      setShowCreateForm(false);
      resetForm();
      await fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message || 'Failed to create user');
    }
  };

  const getRoleBadgeClass = (role: string) => {
    return role === 'admin' ? 'role-badge admin' : 'role-badge comando';
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage user accounts and permissions</p>
        </div>

        {/* User Actions */}
        <div className="users-actions">
          <button className="btn btn-primary" onClick={handleCreateUser}>
            👤 Create User
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Users List */}
        {users.length > 0 ? (
          <div className="users-list">
            <div className="users-header">
              <div className="header-cell">Username</div>
              <div className="header-cell">Role</div>
              <div className="header-cell">Status</div>
            </div>
            
            {users.map((user) => (
              <div key={user.id} className="user-row">
                <div className="user-cell">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    <span className="user-id">ID: {user.id.slice(0, 8)}...</span>
                  </div>
                </div>
                
                <div className="user-cell">
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role === 'admin' ? '👑 Admin' : '⚡ Comando'}
                  </span>
                </div>
                
                <div className="user-cell">
                  <span className="status-badge active">Active</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="users-empty">
            <div className="placeholder-content">
              <div className="placeholder-icon">👥</div>
              <h3>No users found</h3>
              <p>Create the first user account to get started</p>
            </div>
          </div>
        )}

        {/* Create User Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create New User</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateForm(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'comando' })}
                    required
                  >
                    <option value="comando">Comando</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="role-description">
                  {formData.role === 'admin' ? (
                    <div className="role-info admin">
                      <h4>👑 Admin Permissions</h4>
                      <ul>
                        <li>✅ Full access to all features</li>
                        <li>✅ Manage teams, games, and tournaments</li>
                        <li>✅ Create and manage user accounts</li>
                        <li>✅ Delete any content</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="role-info comando">
                      <h4>⚡ Comando Permissions</h4>
                      <ul>
                        <li>✅ Create and edit teams</li>
                        <li>✅ Create and edit games</li>
                        <li>❌ Cannot delete games</li>
                        <li>❌ Cannot manage tournaments</li>
                        <li>❌ Cannot create user accounts</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
