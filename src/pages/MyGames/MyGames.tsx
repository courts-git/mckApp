import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { playersService } from '../../services/playersService';
import { gamesService } from '../../services/firebaseService';
import { Player, Game } from '../../types';
import './MyGames.css';

const MyGames: React.FC = () => {
  const { currentUser } = useAuth();
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [assignedGames, setAssignedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlayerGames();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlayerGames = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      // Find player by username - check both name and username fields
      const allPlayers = await playersService.getAll();
      console.log('🔍 Looking for player with username:', currentUser.username);
      console.log('📋 Available players:', allPlayers.map(p => ({ id: p.id, name: p.name })));
      
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
      
      // If still no match, create a temporary player profile for this user
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

      // At this point, player is guaranteed to exist (we create a temporary one if none found)
      const allGames = await gamesService.getAllWithPlayerNames();
      const playerGames = allGames.filter(
        game => game.playerA === player!.id || game.playerB === player!.id
      );
      
      console.log('🎮 Found games for player:', playerGames.length);
      
      // Sort by date (upcoming first, then recent)
      const sortedGames = playerGames.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const now = new Date();
        
        // Upcoming games first (sorted by date ascending)
        if (dateA >= now && dateB >= now) {
          return dateA.getTime() - dateB.getTime();
        }
        // Past games last (sorted by date descending)
        if (dateA < now && dateB < now) {
          return dateB.getTime() - dateA.getTime();
        }
        // Upcoming games before past games
        return dateA >= now ? -1 : 1;
      });
      
      setAssignedGames(sortedGames);
    } catch (error) {
      console.error('Error fetching player games:', error);
      setError('Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  const getGameResult = (game: Game): 'win' | 'loss' | 'upcoming' | 'pending' => {
    if (game.status !== 'completed') return game.status === 'scheduled' ? 'upcoming' : 'pending';
    if (!playerData) return 'pending';
    
    const isPlayerA = game.playerA === playerData.id;
    const playerScore = isPlayerA ? game.scoreA : game.scoreB;
    const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
    
    return playerScore > opponentScore ? 'win' : 'loss';
  };

  const getUpcomingGames = () => {
    return assignedGames.filter(game => 
      game.status === 'scheduled' && new Date(game.date) >= new Date()
    );
  };

  const getRecentGames = () => {
    return assignedGames.filter(game => 
      game.status === 'completed' || new Date(game.date) < new Date()
    ).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="my-games">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your games...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-games">
        <div className="container">
          <div className="error-message">
            <h2>Unable to Load Games</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingGames = getUpcomingGames();
  const recentGames = getRecentGames();

  return (
    <div className="my-games">
      <div className="my-games-hero">
        <div className="container">
          <h1 className="my-games-title sahara-scrolls">My Games</h1>
          <p className="my-games-subtitle montserrat">
            Track your upcoming matches and review your recent performance
          </p>
        </div>
      </div>

      <div className="my-games-content">
        <div className="container">
          {/* Upcoming Games */}
          <div className="games-section">
            <h2 className="section-title sahara-scrolls">Upcoming Games</h2>
            
            {upcomingGames.length > 0 ? (
              <div className="games-grid">
                {upcomingGames.map((game) => {
                  const isPlayerA = game.playerA === playerData?.id;
                  const opponentName = isPlayerA ? game.playerBName : game.playerAName;
                  
                  return (
                    <div key={game.id} className="game-card upcoming">
                      <div className="game-header">
                        <div className="game-tournament montserrat">
                          {game.tournamentName}
                        </div>
                        <div className="game-date montserrat">
                          {new Date(game.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="game-matchup">
                        <div className="player-info">
                          <span className="player-name">{playerData?.name}</span>
                          <span className="player-label">You</span>
                        </div>
                        
                        <div className="vs-indicator">
                          <span>VS</span>
                        </div>
                        
                        <div className="opponent-info">
                          <span className="opponent-name">{opponentName}</span>
                        </div>
                      </div>
                      
                      <div className="game-details">
                        {game.venue && (
                          <div className="game-venue montserrat">
                            📍 {game.venue}
                          </div>
                        )}
                        <div className="game-status upcoming">
                          <span className="status-badge">Upcoming</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🏀</div>
                <p className="montserrat">No upcoming games scheduled</p>
              </div>
            )}
          </div>

          {/* Recent Games */}
          <div className="games-section">
            <h2 className="section-title sahara-scrolls">Recent Games</h2>
            
            {recentGames.length > 0 ? (
              <div className="games-list">
                {recentGames.map((game) => {
                  const result = getGameResult(game);
                  const isPlayerA = game.playerA === playerData?.id;
                  const opponentName = isPlayerA ? game.playerBName : game.playerAName;
                  const playerScore = isPlayerA ? game.scoreA : game.scoreB;
                  const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
                  
                  return (
                    <div key={game.id} className={`game-item ${result}`}>
                      <div className="game-info">
                        <div className="game-opponent">
                          <strong>vs {opponentName}</strong>
                        </div>
                        <div className="game-tournament montserrat">
                          {game.tournamentName}
                        </div>
                        <div className="game-date montserrat">
                          {new Date(game.date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="game-result">
                        {game.status === 'completed' ? (
                          <>
                            <div className="game-score">
                              <span className="player-score">{playerScore}</span>
                              <span className="score-separator">-</span>
                              <span className="opponent-score">{opponentScore}</span>
                            </div>
                            <div className={`result-badge ${result}`}>
                              {result === 'win' ? 'W' : 'L'}
                            </div>
                          </>
                        ) : (
                          <div className="result-badge pending">
                            {game.status.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p className="montserrat">No recent games to show</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGames;
