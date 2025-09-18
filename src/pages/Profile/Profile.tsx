import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { playersService } from '../../services/playersService';
import { gamesService } from '../../services/firebaseService';
import { Player, Game } from '../../types';
import './Profile.css';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [assignedGames, setAssignedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Player>>({});

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
      setEditFormData({
        name: player!.name,
        age: player!.age,
        height: player!.height,
        weight: player!.weight,
        phoneNumber: player!.phoneNumber,
        email: player!.email
      });

      // At this point, player is guaranteed to exist (we create a temporary one if none found)
      const allGames = await gamesService.getAllWithPlayerNames();
      const playerGames = allGames.filter(
        game => game.playerA === player!.id || game.playerB === player!.id
      );
      setAssignedGames(playerGames);
    } catch (error) {
      console.error('Error fetching player data:', error);
      setError('Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!playerData || !currentUser) return;

    try {
      const updatedPlayer: Partial<Player> = {
        ...editFormData,
        age: parseInt(editFormData.age?.toString() || '0'),
        height: editFormData.height,
        weight: editFormData.weight?.toString() || '0'
      };

      await playersService.update(playerData.id, updatedPlayer, currentUser.username);
      
      // Refresh data
      await fetchPlayerData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const getGameResult = (game: Game): 'win' | 'loss' | 'pending' => {
    if (!playerData || game.status !== 'completed') return 'pending';
    
    const isPlayerA = game.playerA === playerData.id;
    const playerScore = isPlayerA ? game.scoreA : game.scoreB;
    const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
    
    return playerScore > opponentScore ? 'win' : 'loss';
  };

  const getWinLossRecord = () => {
    const wins = assignedGames.filter(game => getGameResult(game) === 'win').length;
    const losses = assignedGames.filter(game => getGameResult(game) === 'loss').length;
    return { wins, losses };
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !playerData) {
    return (
      <div className="profile">
        <div className="container">
          <div className="error-message">
            <h2>Profile Not Found</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { wins, losses } = getWinLossRecord();
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="profile">
      <div className="profile-hero">
        <div className="container">
          <h1 className="profile-title sahara-scrolls">My Profile</h1>
          <p className="profile-subtitle montserrat">
            Manage your personal information and view your tournament history
          </p>
        </div>
      </div>

      <div className="profile-content">
        <div className="container">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          <div className="profile-grid">
            {/* Personal Information */}
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title sahara-scrolls">Personal Information</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={isEditing ? handleSaveChanges : handleEditToggle}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label montserrat">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleInputChange}
                      className="info-input montserrat"
                    />
                  ) : (
                    <p className="info-value montserrat">{playerData?.name}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label montserrat">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={editFormData.age || ''}
                      onChange={handleInputChange}
                      className="info-input montserrat"
                    />
                  ) : (
                    <p className="info-value montserrat">{playerData?.age} years</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label montserrat">Height</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="height"
                      value={editFormData.height || ''}
                      onChange={handleInputChange}
                      className="info-input montserrat"
                      placeholder="e.g., 6'2&quot;"
                    />
                  ) : (
                    <p className="info-value montserrat">{playerData?.height}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label montserrat">Weight</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="weight"
                      value={editFormData.weight || ''}
                      onChange={handleInputChange}
                      className="info-input montserrat"
                    />
                  ) : (
                    <p className="info-value montserrat">{playerData?.weight} lbs</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label montserrat">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      className="info-input montserrat"
                    />
                  ) : (
                    <p className="info-value montserrat">{playerData?.email}</p>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label montserrat">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editFormData.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="info-input montserrat"
                    />
                  ) : (
                    <p className="info-value montserrat">{playerData?.phoneNumber}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button className="btn btn-tertiary" onClick={handleEditToggle}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="profile-section">
              <h2 className="section-title sahara-scrolls">Performance Stats</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{assignedGames.length}</div>
                  <div className="stat-label montserrat">Total Games</div>
                </div>
                
                <div className="stat-card wins">
                  <div className="stat-number">{wins}</div>
                  <div className="stat-label montserrat">Wins</div>
                </div>
                
                <div className="stat-card losses">
                  <div className="stat-number">{losses}</div>
                  <div className="stat-label montserrat">Losses</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{winRate}%</div>
                  <div className="stat-label montserrat">Win Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div className="profile-section full-width">
            <h2 className="section-title sahara-scrolls">My Games</h2>
            
            {assignedGames.length > 0 ? (
              <div className="games-list">
                {assignedGames.slice(0, 10).map((game) => {
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
                              {result.toUpperCase()}
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
                <p className="montserrat">No games assigned yet. Check back later!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
