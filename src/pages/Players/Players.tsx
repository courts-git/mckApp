import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { playersService } from '../../services/playersService';
import { Player } from '../../types';
import './Players.css';

const Players: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    position: '',
    phoneNumber: '',
    email: ''
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const playersData = await playersService.getAll();
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = () => {
    setShowCreateForm(true);
    setEditingPlayer(null);
    resetForm();
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      age: player.age?.toString() || '',
      height: player.height || '',
      weight: player.weight || '',
      position: player.position || '',
      phoneNumber: player.phoneNumber || '',
      email: player.email || ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      height: '',
      weight: '',
      position: '',
      phoneNumber: '',
      email: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Player name is required');
      return;
    }

    try {
      const playerData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height.trim() || undefined,
        weight: formData.weight.trim() || undefined,
        position: formData.position.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        email: formData.email.trim() || undefined
      };

      if (editingPlayer) {
        await playersService.update(editingPlayer.id, playerData, currentUser?.username || '');
      } else {
        await playersService.create(playerData, currentUser?.username || '');
      }

      await fetchPlayers();
      setShowCreateForm(false);
      resetForm();
      setError('');
    } catch (error) {
      console.error('Error saving player:', error);
      setError('Failed to save player');
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      await playersService.delete(id);
      await fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      setError('Failed to delete player');
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.position && player.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canDelete = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="players-page">
        <div className="loading">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="players-page">
      <div className="players-header">
        <h1>Players</h1>
        <button onClick={handleCreatePlayer} className="btn btn-primary">
          Add New Player
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="players-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="players-stats">
        <div className="stat-card">
          <div className="stat-number">{players.length}</div>
          <div className="stat-label">Total Players</div>
        </div>
      </div>

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPlayer ? 'Edit Player' : 'Create New Player'}</h2>
            <form onSubmit={handleSubmit} className="player-form">
              <div className="form-group">
                <label>Player Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    min="10"
                    max="60"
                  />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  >
                    <option value="">Select Position</option>
                    <option value="Point Guard">Point Guard</option>
                    <option value="Shooting Guard">Shooting Guard</option>
                    <option value="Small Forward">Small Forward</option>
                    <option value="Power Forward">Power Forward</option>
                    <option value="Center">Center</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="e.g., 6'2&quot; or 1.88m"
                  />
                </div>
                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="e.g., 180 lbs or 82 kg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="player@example.com"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlayer ? 'Update Player' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="players-grid">
        {filteredPlayers.length === 0 ? (
          <div className="no-players">
            <p>No players found</p>
            {players.length === 0 && (
              <p>Click "Add New Player" to create your first player.</p>
            )}
          </div>
        ) : (
          filteredPlayers.map(player => (
            <div key={player.id} className="player-card">
              <div className="player-info">
                <h3 
                  className="player-name"
                  onClick={() => navigate(`/players/${player.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {player.name}
                </h3>
                <div className="player-details">
                  {player.position && (
                    <span className="player-position">{player.position}</span>
                  )}
                  {player.age && (
                    <span className="player-age">Age: {player.age}</span>
                  )}
                  {player.height && (
                    <span className="player-height">Height: {player.height}</span>
                  )}
                  {player.weight && (
                    <span className="player-weight">Weight: {player.weight}</span>
                  )}
                </div>
                
                {(player.email || player.phoneNumber) && (
                  <div className="player-contact">
                    {player.email && (
                      <span className="contact-email">📧 {player.email}</span>
                    )}
                    {player.phoneNumber && (
                      <span className="contact-phone">📞 {player.phoneNumber}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="player-actions">
                <button
                  onClick={() => navigate(`/players/${player.id}`)}
                  className="btn btn-info btn-sm"
                >
                  View Stats
                </button>
                <button
                  onClick={() => handleEditPlayer(player)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                {canDelete && (
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Players;
