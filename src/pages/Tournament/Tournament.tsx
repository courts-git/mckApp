import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tournamentsService } from '../../services/firebaseService';
import { playersService } from '../../services/playersService';
import { Tournament, Player } from '../../types';
import './Tournament.css';

const TournamentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentsData, playersData] = await Promise.all([
        tournamentsService.getAll(),
        playersService.getAll()
      ]);
      setTournaments(tournamentsData);
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load tournaments data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = () => {
    setShowCreateForm(true);
    setEditingTournament(null);
    setSelectedPlayers([]);
    resetForm();
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setShowCreateForm(true);
    setSelectedPlayers([...tournament.players]);
    
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    
    setFormData({
      name: tournament.name,
      location: tournament.location,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: tournament.status,
      description: tournament.description || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim() || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedPlayers.length < 2) {
      setError('Please select at least 2 players for the tournament');
      return;
    }

    try {
      const tournamentData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        players: selectedPlayers,
        status: formData.status,
        description: formData.description.trim()
      };

      if (editingTournament) {
        await tournamentsService.update(editingTournament.id, tournamentData);
      } else {
        await tournamentsService.create(tournamentData, currentUser?.username || '');
      }

      await fetchData();
      setShowCreateForm(false);
      resetForm();
      setSelectedPlayers([]);
      setError('');
    } catch (error) {
      console.error('Error saving tournament:', error);
      setError('Failed to save tournament');
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament? This will also delete all associated games.')) {
      return;
    }

    try {
      await tournamentsService.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setError('Failed to delete tournament');
    }
  };

  const handlePlayerSelection = (playerId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'var(--text-secondary)';
      case 'active': return 'var(--primary-red)';
      case 'completed': return '#22c55e';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="tournament-page">
        <div className="loading">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <div className="tournament-header">
        <h1>Tournament Management</h1>
        <button onClick={handleCreateTournament} className="btn btn-primary">
          Create New Tournament
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</h2>
            <form onSubmit={handleSubmit} className="tournament-form">
              <div className="form-group">
                <label>Tournament Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Summer Championship 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., MCK Arena, Casablanca"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tournament description, rules, prizes, etc."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Select Players * ({selectedPlayers.length} selected)</label>
                <div className="players-grid">
                  {players.map(player => (
                    <div key={player.id} className="player-checkbox">
                      <input
                        type="checkbox"
                        id={`player-${player.id}`}
                        checked={selectedPlayers.includes(player.id)}
                        onChange={(e) => handlePlayerSelection(player.id, e.target.checked)}
                      />
                      <label htmlFor={`player-${player.id}`} className="player-label">
                        <span className="player-name">{player.name}</span>
                        {player.position && <span className="player-position">{player.position}</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTournament ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tournaments-list">
        {tournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>No tournaments created yet</p>
            <p>Click "Create New Tournament" to organize your first tournament.</p>
          </div>
        ) : (
          tournaments.map(tournament => (
            <div key={tournament.id} className="tournament-card">
              <div className="tournament-info">
                <div className="tournament-header-info">
                  <h3>{tournament.name}</h3>
                  <span 
                    className="tournament-status"
                    style={{ color: getStatusColor(tournament.status) }}
                  >
                    {tournament.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="tournament-details">
                  <p><strong>Location:</strong> {tournament.location}</p>
                  <p><strong>Dates:</strong> {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</p>
                  <p><strong>Players:</strong> {tournament.players.length} registered</p>
                  {tournament.description && (
                    <p><strong>Description:</strong> {tournament.description}</p>
                  )}
                </div>

                <div className="tournament-stats">
                  <div className="stat">
                    <span className="stat-number">{tournament.players.length}</span>
                    <span className="stat-label">Players</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">
                      {Math.floor((tournament.players.length * (tournament.players.length - 1)) / 2)}
                    </span>
                    <span className="stat-label">Possible Games</span>
                  </div>
                </div>
              </div>

              <div className="tournament-actions">
                <button
                  onClick={() => handleEditTournament(tournament)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTournament(tournament.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TournamentPage;
