import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { playersService } from '../../services/playersService';
import { gamesService, tournamentsService } from '../../services/firebaseService';
import { Player, Game, Tournament } from '../../types';
import './MyTournaments.css';

const MyTournaments: React.FC = () => {
  const { currentUser } = useAuth();
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentGames, setTournamentGames] = useState<{ [key: string]: Game[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlayerTournaments();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlayerTournaments = async () => {
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

      // At this point, player is guaranteed to exist (we create a temporary one if none found)
      const allGames = await gamesService.getAllWithPlayerNames();
      const playerGames = allGames.filter(
        game => game.playerA === player!.id || game.playerB === player!.id
      );

      // Get unique tournament IDs from player's games
      const tournamentIds = Array.from(new Set(playerGames.map(game => game.tournamentId)));

      // Fetch tournament details
      const allTournaments = await tournamentsService.getAllWithPlayerNames();
      const playerTournaments = allTournaments.filter(tournament => 
        tournamentIds.includes(tournament.id)
      );

      setTournaments(playerTournaments);

      // Group games by tournament
      const gamesByTournament: { [key: string]: Game[] } = {};
      tournamentIds.forEach(tournamentId => {
        gamesByTournament[tournamentId] = playerGames.filter(
          game => game.tournamentId === tournamentId
        );
      });

      setTournamentGames(gamesByTournament);
    } catch (error) {
      console.error('Error fetching player tournaments:', error);
      setError('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const getTournamentStats = (tournamentId: string) => {
    const games = tournamentGames[tournamentId] || [];
    const completedGames = games.filter(game => game.status === 'completed');
    
    let wins = 0;
    let losses = 0;
    let totalPoints = 0;

    completedGames.forEach(game => {
      if (!playerData) return;
      
      const isPlayerA = game.playerA === playerData.id;
      const playerScore = isPlayerA ? game.scoreA : game.scoreB;
      const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
      
      totalPoints += playerScore;
      
      if (playerScore > opponentScore) {
        wins++;
      } else {
        losses++;
      }
    });

    return {
      totalGames: games.length,
      completedGames: completedGames.length,
      wins,
      losses,
      winRate: completedGames.length > 0 ? Math.round((wins / completedGames.length) * 100) : 0,
      averagePoints: completedGames.length > 0 ? Math.round(totalPoints / completedGames.length) : 0
    };
  };

  const getTournamentStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'completed' => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'ongoing';
  };

  if (loading) {
    return (
      <div className="my-tournaments">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your tournaments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-tournaments">
        <div className="container">
          <div className="error-message">
            <h2>Unable to Load Tournaments</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tournaments">
      <div className="my-tournaments-hero">
        <div className="container">
          <h1 className="my-tournaments-title sahara-scrolls">My Tournaments</h1>
          <p className="my-tournaments-subtitle montserrat">
            View your tournament participation and track your performance
          </p>
        </div>
      </div>

      <div className="my-tournaments-content">
        <div className="container">
          {tournaments.length > 0 ? (
            <div className="tournaments-grid">
              {tournaments.map((tournament) => {
                const stats = getTournamentStats(tournament.id);
                const status = getTournamentStatus(tournament);
                const games = tournamentGames[tournament.id] || [];
                
                return (
                  <div key={tournament.id} className={`tournament-card ${status}`}>
                    <div className="tournament-header">
                      <h3 className="tournament-name sahara-scrolls">{tournament.name}</h3>
                      <span className={`tournament-status ${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>

                    <div className="tournament-info">
                      <div className="tournament-dates montserrat">
                        <div className="date-item">
                          <span className="date-label">Start:</span>
                          <span className="date-value">
                            {new Date(tournament.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="date-item">
                          <span className="date-label">End:</span>
                          <span className="date-value">
                            {new Date(tournament.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {tournament.location && (
                        <div className="tournament-location montserrat">
                          📍 {tournament.location}
                        </div>
                      )}
                    </div>

                    <div className="tournament-stats">
                      <div className="stats-grid">
                        <div className="stat-item">
                          <div className="stat-number">{stats.totalGames}</div>
                          <div className="stat-label montserrat">Games</div>
                        </div>
                        
                        <div className="stat-item">
                          <div className="stat-number">{stats.wins}</div>
                          <div className="stat-label montserrat">Wins</div>
                        </div>
                        
                        <div className="stat-item">
                          <div className="stat-number">{stats.losses}</div>
                          <div className="stat-label montserrat">Losses</div>
                        </div>
                        
                        <div className="stat-item">
                          <div className="stat-number">{stats.winRate}%</div>
                          <div className="stat-label montserrat">Win Rate</div>
                        </div>
                      </div>
                    </div>

                    {stats.completedGames > 0 && (
                      <div className="tournament-performance">
                        <div className="performance-metric">
                          <span className="metric-label montserrat">Average Points:</span>
                          <span className="metric-value">{stats.averagePoints}</span>
                        </div>
                      </div>
                    )}

                    <div className="tournament-games">
                      <h4 className="games-title montserrat">Your Games</h4>
                      <div className="games-summary">
                        {games.length > 0 ? (
                          <div className="games-list-summary">
                            {games.slice(0, 3).map((game) => {
                              const isPlayerA = game.playerA === playerData?.id;
                              const opponentName = isPlayerA ? game.playerBName : game.playerAName;
                              
                              return (
                                <div key={game.id} className="game-summary-item montserrat">
                                  <span>vs {opponentName}</span>
                                  <span className={`game-result ${game.status}`}>
                                    {game.status === 'completed' ? (
                                      (() => {
                                        const playerScore = isPlayerA ? game.scoreA : game.scoreB;
                                        const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
                                        return playerScore > opponentScore ? 'W' : 'L';
                                      })()
                                    ) : (
                                      game.status.charAt(0).toUpperCase()
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                            {games.length > 3 && (
                              <div className="more-games montserrat">
                                +{games.length - 3} more games
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="no-games montserrat">No games scheduled</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏆</div>
              <h3>No Tournament Participation</h3>
              <p className="montserrat">You haven't been assigned to any tournaments yet. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTournaments;
