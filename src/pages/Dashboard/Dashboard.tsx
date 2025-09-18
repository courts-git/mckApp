import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardCardProps } from '../../types';
import { authService } from '../../services/authService';
import { gamesService, tournamentsService } from '../../services/firebaseService';
import { playersService } from '../../services/playersService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    players: 0,
    games: 0,
    tournaments: 0,
    activeGames: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [playersData, gamesData, tournamentsData] = await Promise.all([
        playersService.getAll(),
        gamesService.getAll(),
        tournamentsService.getAll()
      ]);
      
      const activeGamesCount = gamesData.filter(game => 
        game.status === 'live' || game.status === 'scheduled'
      ).length;

      setStats({
        players: playersData.length,
        games: gamesData.length,
        tournaments: tournamentsData.length,
        activeGames: activeGamesCount
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const DashboardCard: React.FC<DashboardCardProps> = ({ title, count, icon, color, link }) => (
    <Link to={link} className="dashboard-card" style={{ borderTopColor: color }}>
      <div className="card-header">
        <div className="card-icon" style={{ color }}>
          {icon}
        </div>
        <div className="card-count">{count}</div>
      </div>
      <div className="card-title">{title}</div>
      <div className="card-action">
        View {title} →
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {error && <div className="error-message">{error}</div>}
        
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>
            Welcome back, <strong>{currentUser?.username}</strong>!
          </p>
        </div>

        <div className="dashboard-grid">
          {/* Teams Card - Available to all users */}
          <DashboardCard
            title="Players"
            count={stats.players}
            icon="👥"
            color="var(--primary-color)"
            link="/players"
          />

          {/* Games Card - Available to all users */}
          <DashboardCard
            title="Games"
            count={stats.games}
            icon="🏀"
            color="var(--secondary-color)"
            link="/games"
          />

          {/* Active Games Card - Available to all users */}
          <DashboardCard
            title="Active Games"
            count={stats.activeGames}
            icon="🔴"
            color="#ff4444"
            link="/games?filter=active"
          />

          {/* Tournaments Card - Admin only */}
          {authService.hasRole(currentUser, 'admin') && (
            <DashboardCard
              title="Tournaments"
              count={stats.tournaments}
              icon="🏆"
              color="var(--accent-color)"
              link="/tournaments"
            />
          )}

          {/* User Management Card - Admin only */}
          {authService.hasRole(currentUser, 'admin') && (
            <DashboardCard
              title="Users"
              count={2} // Mock data
              icon="👤"
              color="#9c27b0"
              link="/users"
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {/* Create Team - Available to all users */}
            {authService.canPerformAction(currentUser, 'create', 'players') && (
              <Link to="/teams/create" className="action-card create-team">
                <div className="action-icon">➕</div>
                <div className="action-title">Create Team</div>
                <div className="action-description">Add a new team to the tournament</div>
              </Link>
            )}

            {/* Create Game - Available to all users */}
            {authService.canPerformAction(currentUser, 'create', 'games') && (
              <Link to="/games/create" className="action-card create-game">
                <div className="action-icon">📅</div>
                <div className="action-title">Schedule Game</div>
                <div className="action-description">Schedule a new game between teams</div>
              </Link>
            )}

            {/* Create Tournament - Admin only */}
            {authService.canPerformAction(currentUser, 'create', 'tournaments') && (
              <Link to="/tournaments/create" className="action-card create-tournament">
                <div className="action-icon">🏆</div>
                <div className="action-title">Create Tournament</div>
                <div className="action-description">Start a new tournament</div>
              </Link>
            )}

            {/* Create User - Admin only */}
            {currentUser?.role === 'admin' && (
              <Link to="/users/create" className="action-card create-user">
                <div className="action-icon">👤</div>
                <div className="action-title">Add User</div>
                <div className="action-description">Create a new user account</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
