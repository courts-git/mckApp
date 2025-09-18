// User types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'comando' | 'player';
}

export interface UserDocument {
  username: string;
  passwordHash: string;
  role: 'admin' | 'comando' | 'player';
}

// Player types (for 1v1 tournaments)
export interface Player {
  id: string;
  name: string;
  age?: number;
  height?: string;
  weight?: string;
  position?: string;
  phoneNumber?: string;
  email?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// Game types (1v1 games)
export interface Game {
  id: string;
  playerA: string; // Player ID
  playerB: string; // Player ID
  playerAName?: string; // For display purposes
  playerBName?: string; // For display purposes
  scoreA: number;
  scoreB: number;
  date: Date;
  tournamentId: string; // Tournament this game belongs to
  tournamentName?: string; // For display purposes
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  venue?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  players: string[]; // Array of player IDs
  status: 'upcoming' | 'active' | 'completed';
  description?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// Player statistics and history types
export interface PlayerStats {
  playerId: string;
  tournamentId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalPointsScored: number;
  averagePointsPerGame: number;
  winRatio: number;
}

export interface PlayerTournamentHistory {
  tournament: Tournament;
  stats: PlayerStats;
  games: Game[];
}

// Auth types
export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Component props types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'comando' | 'player';
}

export interface DashboardCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}
