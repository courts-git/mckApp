import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, PlayerTournamentHistory } from '../../types';
import { playersService } from '../../services/playersService';
import './PlayerDetails.css';

interface PlayerDetailsProps {}

const PlayerDetails: React.FC<PlayerDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [tournamentHistory, setTournamentHistory] = useState<PlayerTournamentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadPlayerDetails(id);
    }
  }, [id]);

  const loadPlayerDetails = async (playerId: string) => {
    try {
      setLoading(true);
      const [playerData, history] = await Promise.all([
        playersService.getById(playerId),
        playersService.getTournamentHistory(playerId)
      ]);

      setPlayer(playerData);
      setTournamentHistory(history);
    } catch (err) {
      console.error('Error loading player details:', err);
      setError('Failed to load player details');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    let totalGames = 0;
    let totalWins = 0;
    let totalPointsScored = 0;
    let totalTournaments = tournamentHistory.length;

    tournamentHistory.forEach(history => {
      totalGames += history.stats.gamesPlayed;
      totalWins += history.stats.wins;
      totalPointsScored += history.stats.totalPointsScored;
    });

    const overallWinRatio = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
    const averagePointsPerGame = totalGames > 0 ? totalPointsScored / totalGames : 0;

    return {
      totalTournaments,
      totalGames,
      totalWins,
      totalLosses: totalGames - totalWins,
      overallWinRatio,
      totalPointsScored,
      averagePointsPerGame
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'active': return 'var(--primary-red)';
      case 'upcoming': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="player-details">
        <div className="loading">Loading player details...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="player-details">
        <div className="error-message">{error || 'Player not found'}</div>
        <button onClick={() => navigate('/players')} className="btn btn-secondary">
          Back to Players
        </button>
      </div>
    );
  }

  const overallStats = calculateOverallStats();

  return (
    <div className="player-details">
      <div className="player-details-header">
        <button onClick={() => navigate('/players')} className="btn btn-secondary back-btn">
          ← Back to Players
        </button>
        <div className="player-info">
          <h1>{player.name}</h1>
          <div className="player-basic-info">
            {player.age && <span>Age: {player.age}</span>}
            {player.height && <span>Height: {player.height}</span>}
            {player.weight && <span>Weight: {player.weight}</span>}
            {player.position && <span>Position: {player.position}</span>}
          </div>
          {(player.email || player.phoneNumber) && (
            <div className="player-contact">
              {player.email && <span>📧 {player.email}</span>}
              {player.phoneNumber && <span>📞 {player.phoneNumber}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="stats-overview">
        <h2>Overall Statistics</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-number">{overallStats.totalTournaments}</div>
            <div className="stat-label">Tournaments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overallStats.totalGames}</div>
            <div className="stat-label">Games Played</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overallStats.totalWins}</div>
            <div className="stat-label">Wins</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overallStats.totalLosses}</div>
            <div className="stat-label">Losses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overallStats.overallWinRatio.toFixed(1)}%</div>
            <div className="stat-label">Win Ratio</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overallStats.totalPointsScored}</div>
            <div className="stat-label">Total Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overallStats.averagePointsPerGame.toFixed(1)}</div>
            <div className="stat-label">Avg Points/Game</div>
          </div>
        </div>
      </div>

      <div className="tournament-history">
        <h2>Tournament History</h2>
        {tournamentHistory.length === 0 ? (
          <div className="no-history">
            <p>No tournament history available for this player.</p>
          </div>
        ) : (
          <div className="tournaments-list">
            {tournamentHistory.map(history => (
              <div key={history.tournament.id} className="tournament-card">
                <div className="tournament-header" style={{display: 'block'}}>
                  <h3>{history.tournament.name}</h3>
                  <span 
                    className="tournament-status"
                    style={{ color: getStatusColor(history.tournament.status) }}
                  >
                    {history.tournament.status.toUpperCase()}
                  </span>
                </div>
                <div className="tournament-info">
                  <p><strong>Location:</strong> {history.tournament.location}</p>
                  <p><strong>Date:</strong> {new Date(history.tournament.startDate).toLocaleDateString()} - {new Date(history.tournament.endDate).toLocaleDateString()}</p>
                  {history.tournament.description && (
                    <p><strong>Description:</strong> {history.tournament.description}</p>
                  )}
                </div>
                
                <div className="tournament-stats">
                  <h4>Tournament Performance</h4>
                  <div className="tournament-stats-grid">
                    <div className="tournament-stat">
                      <span className="stat-value">{history.stats.gamesPlayed}</span>
                      <span className="stat-label">Games</span>
                    </div>
                    <div className="tournament-stat">
                      <span className="stat-value">{history.stats.wins}</span>
                      <span className="stat-label">Wins</span>
                    </div>
                    <div className="tournament-stat">
                      <span className="stat-value">{history.stats.losses}</span>
                      <span className="stat-label">Losses</span>
                    </div>
                    <div className="tournament-stat">
                      <span className="stat-value">{(history.stats.winRatio * 100).toFixed(1)}%</span>
                      <span className="stat-label">Win Rate</span>
                    </div>
                    <div className="tournament-stat">
                      <span className="stat-value">{history.stats.totalPointsScored}</span>
                      <span className="stat-label">Points</span>
                    </div>
                    <div className="tournament-stat">
                      <span className="stat-value">{history.stats.averagePointsPerGame.toFixed(1)}</span>
                      <span className="stat-label">Avg/Game</span>
                    </div>
                  </div>
                </div>

                <div className="tournament-games">
                  <h4>Games Played</h4>
                  {history.games.length === 0 ? (
                    <p>No games recorded for this tournament.</p>
                  ) : (
                    <div className="games-list">
                      {history.games
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(game => {
                          const isPlayerA = game.playerA === player.id;
                          const playerScore = isPlayerA ? game.scoreA : game.scoreB;
                          const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
                          const opponentName = isPlayerA ? game.playerBName : game.playerAName;
                          const result = playerScore > opponentScore ? 'Win' : 'Loss';
                          const resultClass = result === 'Win' ? 'game-win' : 'game-loss';
                          
                          return (
                            <div key={game.id} className={`game-item ${resultClass}`}>
                              <div className="game-matchup">
                                <span className="player-name">{player.name}</span>
                                <span className="vs">vs</span>
                                <span className="opponent-name">{opponentName}</span>
                              </div>
                              <div className="game-score">
                                <span className="score">{playerScore} - {opponentScore}</span>
                                <span className="result">{result}</span>
                              </div>
                              <div className="game-info">
                                <span className="game-date">
                                  {new Date(game.date).toLocaleDateString()}
                                </span>
                                <span className="game-status">{game.status}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetails;
