import React, { useState, useEffect } from 'react';
import { gamesService, tournamentsService } from '../../services/firebaseService';
import { Game, Tournament } from '../../types';
import './Schedule.css';

const Schedule: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gamesData, tournamentsData] = await Promise.all([
        gamesService.getAllWithPlayerNames(),
        tournamentsService.getAll()
      ]);
      setGames(gamesData);
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredGames = () => {
    let filteredGames = games;

    // Filter by tournament
    if (selectedTournament) {
      filteredGames = filteredGames.filter(game => game.tournamentId === selectedTournament);
    }

    // Filter by date
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

    switch (dateFilter) {
      case 'today':
        filteredGames = filteredGames.filter(game => {
          const gameDate = new Date(game.date);
          return gameDate >= startOfToday && gameDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        });
        break;
      case 'week':
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        filteredGames = filteredGames.filter(game => {
          const gameDate = new Date(game.date);
          return gameDate >= startOfWeek && gameDate < endOfWeek;
        });
        break;
      case 'upcoming':
        filteredGames = filteredGames.filter(game => new Date(game.date) >= startOfToday);
        break;
    }

    // Sort by date
    return filteredGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  const formatGameTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatGameDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupGamesByDate = (games: Game[]) => {
    const grouped: { [date: string]: Game[] } = {};
    
    games.forEach(game => {
      const dateKey = new Date(game.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(game);
    });

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  if (loading) {
    return (
      <div className="schedule">
        <div className="loading">Loading schedule...</div>
      </div>
    );
  }

  const filteredGames = getFilteredGames();
  const groupedGames = groupGamesByDate(filteredGames);

  return (
    <div className="schedule">
      <div className="schedule-header">
        <div className="header-content">
          <h1>Game Schedule</h1>
          <p>View all games across tournaments - your complete basketball calendar</p>
        </div>
        <div className="schedule-stats">
          <div className="stat-card">
            <span className="stat-number">{games.length}</span>
            <span className="stat-label">Total Games</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{games.filter(g => g.status === 'live').length}</span>
            <span className="stat-label">Live Now</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{games.filter(g => g.status === 'scheduled' && new Date(g.date) >= new Date()).length}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="schedule-filters">
        <div className="filter-group">
          <label>Tournament:</label>
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

        <div className="filter-group">
          <label>Date Range:</label>
          <div className="filter-buttons">
            {[
              { key: 'all', label: 'All Games' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'upcoming', label: 'Upcoming' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setDateFilter(filter.key)}
                className={`filter-btn ${dateFilter === filter.key ? 'active' : ''}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="schedule-content">
        {filteredGames.length === 0 ? (
          <div className="no-games">
            <h3>No games found</h3>
            <p>
              {selectedTournament 
                ? "No games scheduled for the selected tournament and date range." 
                : "No games match your current filters."
              }
            </p>
          </div>
        ) : (
          <div className="games-timeline">
            {groupedGames.map(([dateString, dayGames]) => (
              <div key={dateString} className="date-group">
                <div className="date-header">
                  <h3>{formatGameDate(new Date(dateString))}</h3>
                  <span className="games-count">{dayGames.length} game{dayGames.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="day-games">
                  {dayGames.map(game => (
                    <div key={game.id} className={`schedule-game ${game.status}`}>
                      <div className="game-time">
                        <span className="time">{formatGameTime(game.date)}</span>
                        <span 
                          className="status"
                          style={{ color: getStatusColor(game.status) }}
                        >
                          {game.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="game-matchup">
                        <div className="player player-a">
                          <span className="player-name">{game.playerAName}</span>
                          {game.status === 'completed' && (
                            <span className="player-score">{game.scoreA}</span>
                          )}
                        </div>
                        
                        <div className="vs-section">
                          <span className="vs">VS</span>
                          {game.status === 'completed' && (
                            <div className="final-score">
                              {game.scoreA} - {game.scoreB}
                            </div>
                          )}
                        </div>
                        
                        <div className="player player-b">
                          {game.status === 'completed' && (
                            <span className="player-score">{game.scoreB}</span>
                          )}
                          <span className="player-name">{game.playerBName}</span>
                        </div>
                      </div>
                      
                      <div className="game-meta">
                        <div className="tournament-info">
                          <span className="tournament-name">
                            {tournaments.find(t => t.id === game.tournamentId)?.name || 'Unknown Tournament'}
                          </span>
                        </div>
                        {game.venue && (
                          <div className="venue-info">
                            📍 {game.venue}
                          </div>
                        )}
                        {game.status === 'completed' && (
                          <div className="winner-info">
                            🏆 {game.scoreA > game.scoreB ? game.playerAName : game.playerBName} wins
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;