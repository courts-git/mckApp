import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { playersService } from '../../services/playersService';
import { gamesService } from '../../services/firebaseService';
import { Player, Game } from '../../types';
import './PlayerDashboard.css';

const PlayerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });

  useEffect(() => {
    fetchPlayerData();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlayerData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      // Find player by username - check both name and username fields
      const allPlayers = await playersService.getAll();
      console.log('🔍 Looking for player with username:', currentUser.username);
      
      // Try to match by name first, then by other fields
      let player = allPlayers.find(p => p.name.toLowerCase() === currentUser.username.toLowerCase());
      
      // If no match by name, check other fields
      if (!player) {
        player = allPlayers.find(p => 
          (p.email && p.email.toLowerCase() === currentUser.username.toLowerCase()) ||
          p.id === currentUser.id ||
          p.name.toLowerCase().includes(currentUser.username.toLowerCase())
        );
      }
      
      // If still no match, create a temporary player profile
      if (!player) {
        console.log('⚠️ No matching player found. Creating temporary profile for user.');
        player = {
          id: currentUser.id,
          name: currentUser.username,
          age: 25,
          height: "6'0\"",
          weight: "180",
          phoneNumber: "N/A",
          email: "N/A"
        };
        console.log('✅ Temporary player profile created:', player);
      }
      
      setPlayerData(player);

      // Fetch all games for this player
      const allGames = await gamesService.getAllWithPlayerNames();
      const playerGames = allGames.filter(
        game => game.playerA === player!.id || game.playerB === player!.id
      );

      // Separate upcoming and recent games
      const now = new Date();
      const upcoming = playerGames.filter(game => 
        game.status === 'scheduled' && new Date(game.date) >= now
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

      const recent = playerGames.filter(game => 
        game.status === 'completed'
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

      setUpcomingGames(upcoming);
      setRecentGames(recent);

      // Calculate stats
      const completedGames = playerGames.filter(game => game.status === 'completed');
      const wins = completedGames.filter(game => {
        const isPlayerA = game.playerA === player!.id;
        const playerScore = isPlayerA ? game.scoreA : game.scoreB;
        const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
        return playerScore > opponentScore;
      }).length;

      const losses = completedGames.length - wins;
      const winRate = completedGames.length > 0 ? Math.round((wins / completedGames.length) * 100) : 0;

      setStats({
        totalGames: playerGames.length,
        wins,
        losses,
        winRate
      });

    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameResult = (game: Game): 'win' | 'loss' => {
    if (!playerData) return 'loss';
    
    const isPlayerA = game.playerA === playerData.id;
    const playerScore = isPlayerA ? game.scoreA : game.scoreB;
    const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
    
    return playerScore > opponentScore ? 'win' : 'loss';
  };

  if (loading) {
    return (
      <div className="player-dashboard">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-dashboard">
      <div className="dashboard-hero">
        <div className="container">
          <h1 className="dashboard-title sahara-scrolls">Welcome, {playerData?.name}!</h1>
          <p className="dashboard-subtitle montserrat">
            Your personal MCK tournament dashboard
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="container">
          {/* Stats Overview */}
          <div className="stats-section">
            <h2 className="section-title sahara-scrolls">Performance Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.totalGames}</div>
                <div className="stat-label montserrat">Total Games</div>
              </div>
              <div className="stat-card wins">
                <div className="stat-number">{stats.wins}</div>
                <div className="stat-label montserrat">Wins</div>
              </div>
              <div className="stat-card losses">
                <div className="stat-number">{stats.losses}</div>
                <div className="stat-label montserrat">Losses</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.winRate}%</div>
                <div className="stat-label montserrat">Win Rate</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Upcoming Games */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title sahara-scrolls">Upcoming Games</h3>
                <Link to="/my-games" className="view-all-link">View All</Link>
              </div>
              
              {upcomingGames.length > 0 ? (
                <div className="games-preview">
                  {upcomingGames.map((game) => {
                    const isPlayerA = game.playerA === playerData?.id;
                    const opponentName = isPlayerA ? game.playerBName : game.playerAName;
                    
                    return (
                      <div key={game.id} className="game-preview-item">
                        <div className="game-info">
                          <div className="game-opponent">vs {opponentName}</div>
                          <div className="game-tournament">{game.tournamentName}</div>
                          <div className="game-date">
                            {new Date(game.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="game-status upcoming">
                          <span className="status-badge">Upcoming</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No upcoming games scheduled</p>
                </div>
              )}
            </div>

            {/* Recent Games */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title sahara-scrolls">Recent Results</h3>
                <Link to="/my-games" className="view-all-link">View All</Link>
              </div>
              
              {recentGames.length > 0 ? (
                <div className="games-preview">
                  {recentGames.map((game) => {
                    const result = getGameResult(game);
                    const isPlayerA = game.playerA === playerData?.id;
                    const opponentName = isPlayerA ? game.playerBName : game.playerAName;
                    const playerScore = isPlayerA ? game.scoreA : game.scoreB;
                    const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
                    
                    return (
                      <div key={game.id} className={`game-preview-item ${result}`}>
                        <div className="game-info">
                          <div className="game-opponent">vs {opponentName}</div>
                          <div className="game-score">{playerScore} - {opponentScore}</div>
                          <div className="game-date">
                            {new Date(game.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`game-status ${result}`}>
                          <span className="status-badge">
                            {result === 'win' ? 'W' : 'L'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No recent games to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <h2 className="section-title sahara-scrolls">Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/my-games" className="action-card">
                <div className="action-icon">🎮</div>
                <div className="action-title">My Games</div>
                <div className="action-description">View all your scheduled and completed games</div>
              </Link>
              
              <Link to="/my-tournaments" className="action-card">
                <div className="action-icon">🏆</div>
                <div className="action-title">My Tournaments</div>
                <div className="action-description">Check your tournament participation</div>
              </Link>
              
              <Link to="/profile" className="action-card">
                <div className="action-icon">👤</div>
                <div className="action-title">My Profile</div>
                <div className="action-description">Update your personal information</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
