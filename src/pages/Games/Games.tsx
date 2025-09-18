import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService, tournamentsService } from '../../services/firebaseService';
import { playersService } from '../../services/playersService';
import { Game, Player, Tournament } from '../../types';
import './Games.css';

const Games: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [gamesByTournament, setGamesByTournament] = useState<{ [tournamentId: string]: Game[] }>({});
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    playerA: '',
    playerB: '',
    scoreA: 0,
    scoreB: 0,
    date: '',
    time: '',
    tournamentId: '',
    status: 'scheduled' as 'scheduled' | 'live' | 'completed' | 'cancelled',
    venue: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gamesData, tournamentsData, playersData] = await Promise.all([
        gamesService.getAllWithPlayerNames(),
        tournamentsService.getAllWithPlayerNames(),
        playersService.getAll()
      ]);
      
      // Group games by tournament
      const groupedGames: { [tournamentId: string]: Game[] } = {};
      
      gamesData.forEach((game: Game) => {
        if (!groupedGames[game.tournamentId]) {
          groupedGames[game.tournamentId] = [];
        }
        groupedGames[game.tournamentId].push(game);
      });
      
      // Sort games within each tournament by date
      Object.keys(groupedGames).forEach(tournamentId => {
        groupedGames[tournamentId].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
      
      setGamesByTournament(groupedGames);
      setTournaments(tournamentsData);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load games data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = () => {
    setShowCreateForm(true);
    setEditingGame(null);
    resetForm();
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    const gameDate = new Date(game.date);
    setFormData({
      playerA: game.playerA,
      playerB: game.playerB,
      scoreA: game.scoreA,
      scoreB: game.scoreB,
      date: gameDate.toISOString().split('T')[0],
      time: gameDate.toTimeString().slice(0, 5),
      tournamentId: game.tournamentId,
      status: game.status,
      venue: game.venue || ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      playerA: '',
      playerB: '',
      scoreA: 0,
      scoreB: 0,
      date: '',
      time: '',
      tournamentId: '',
      status: 'scheduled',
      venue: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.playerA || !formData.playerB || !formData.tournamentId || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.playerA === formData.playerB) {
      setError('Please select different players');
      return;
    }

    try {
      const gameDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const gameData = {
        playerA: formData.playerA,
        playerB: formData.playerB,
        scoreA: formData.scoreA,
        scoreB: formData.scoreB,
        date: gameDateTime,
        tournamentId: formData.tournamentId,
        status: formData.status,
        venue: formData.venue || undefined
      };

      if (editingGame) {
        await gamesService.update(editingGame.id, gameData, currentUser?.username || '');
      } else {
        await gamesService.create(gameData, currentUser?.username || '');
      }

      await fetchData();
      setShowCreateForm(false);
      resetForm();
      setError('');
    } catch (error) {
      console.error('Error saving game:', error);
      setError('Failed to save game');
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      await gamesService.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting game:', error);
      setError('Failed to delete game');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'var(--text-secondary)';
      case 'live': return 'var(--primary-red)';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  const getGameResult = (game: Game) => {
    if (game.status !== 'completed') return null;
    
    if (game.scoreA > game.scoreB) {
      return { winner: game.playerAName, loser: game.playerBName };
    } else {
      return { winner: game.playerBName, loser: game.playerAName };
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedTournament && tournament.id !== selectedTournament) return false;
    return true;
  });

  const canDelete = currentUser?.role === 'admin';
  const canCreate = true; // Both admin and comando can create games

  if (loading) {
    return (
      <div className="games-page">
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Games by Tournament</h1>
        {canCreate && (
          <button onClick={handleCreateGame} className="btn btn-primary">
            Schedule New Game
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="games-controls">
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tournaments</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Game Creation Form */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingGame ? 'Edit Game' : 'Schedule New Game'}</h2>
            <form onSubmit={handleSubmit} className="game-form">
              <div className="form-group">
                <label>Tournament *</label>
                <select
                  value={formData.tournamentId}
                  onChange={(e) => setFormData({...formData, tournamentId: e.target.value})}
                  required
                >
                  <option value="">Select Tournament</option>
                  {tournaments.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Player A *</label>
                  <select
                    value={formData.playerA}
                    onChange={(e) => setFormData({...formData, playerA: e.target.value})}
                    required
                  >
                    <option value="">Select Player A</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Player B *</label>
                  <select
                    value={formData.playerB}
                    onChange={(e) => setFormData({...formData, playerB: e.target.value})}
                    required
                  >
                    <option value="">Select Player B</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    placeholder="Game venue"
                  />
                </div>
              </div>

              {(formData.status === 'completed' || formData.status === 'live') && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Player A Score</label>
                    <input
                      type="number"
                      value={formData.scoreA}
                      onChange={(e) => setFormData({...formData, scoreA: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Player B Score</label>
                    <input
                      type="number"
                      value={formData.scoreB}
                      onChange={(e) => setFormData({...formData, scoreB: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGame ? 'Update Game' : 'Schedule Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournaments and Games Display */}
      <div className="tournaments-list">
        {filteredTournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>No tournaments found</p>
            {tournaments.length === 0 && (
              <p>Create some tournaments first to schedule games.</p>
            )}
          </div>
        ) : (
          filteredTournaments.map(tournament => {
            const tournamentGames = (gamesByTournament[tournament.id] || []).filter(game => 
              filterStatus === 'all' || game.status === filterStatus
            );

            return (
              <div key={tournament.id} className="tournament-section">
                <div className="tournament-header">
                  <div className="tournament-info">
                    <h2>{tournament.name}</h2>
                    <p>{tournament.location} • {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</p>
                    <span className="tournament-status" >
                      {tournament.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="tournament-stats">
                    <div className="stat">
                      <span className="stat-number">{tournamentGames.length}</span>
                      <span className="stat-label">Games</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{tournamentGames.filter(g => g.status === 'completed').length}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                  </div>
                </div>

                {tournamentGames.length === 0 ? (
                  <div className="no-games">
                    <p>No games scheduled for this tournament yet.</p>
                  </div>
                ) : (
                  <div className="games-list">
                    {tournamentGames.map(game => {
                      const result = getGameResult(game);
                      return (
                        <div key={game.id} className={`game-card ${game.status}`}>
                          <div className="game-info">
                            <div className="game-matchup">
                              <div className="player player-a">
                                <span 
                                  className="player-name clickable"
                                  onClick={() => navigate(`/players/${game.playerA}`)}
                                >
                                  {game.playerAName}
                                </span>
                                <span className="player-score">{game.scoreA}</span>
                              </div>
                              <div className="vs">VS</div>
                              <div className="player player-b">
                                <span className="player-score">{game.scoreB}</span>
                                <span 
                                  className="player-name clickable"
                                  onClick={() => navigate(`/players/${game.playerB}`)}
                                >
                                  {game.playerBName}
                                </span>
                              </div>
                            </div>
                            
                            {result && (
                              <div className="game-result">
                                🏆 <strong>{result.winner}</strong> defeats {result.loser}
                              </div>
                            )}
                            
                            <div className="game-details">
                              <span className="game-date">
                                📅 {new Date(game.date).toLocaleDateString()} at {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {game.venue && (
                                <span className="game-venue">📍 {game.venue}</span>
                              )}
                              <span 
                                className="game-status"
                                style={{ color: getStatusColor(game.status) }}
                              >
                                {game.status.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="game-actions">
                            <button
                              onClick={() => handleEditGame(game)}
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteGame(game.id)}
                                className="btn btn-danger btn-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Games;
