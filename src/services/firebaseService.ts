import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Game, Tournament } from '../types';

// Teams Service
export const teamsService = {
  // Get all teams
  async getAll(): Promise<any[]> {
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as any[];
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  // Get team by ID
  async getById(id: string): Promise<any | null> {
    try {
      const teamDoc = await getDoc(doc(db, 'teams', id));
      if (teamDoc.exists()) {
        return {
          id: teamDoc.id,
          ...teamDoc.data(),
          createdAt: teamDoc.data().createdAt?.toDate()
        } as any;
      }
      return null;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  // Create new team
  async create(team: any, currentUser: string): Promise<string> {
    try {
      const teamData = {
        ...team,
        createdAt: Timestamp.now(),
        createdBy: currentUser
      };
      
      const docRef = await addDoc(collection(db, 'teams'), teamData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  // Update team
  async update(id: string, team: any): Promise<void> {
    try {
      const teamRef = doc(db, 'teams', id);
      await updateDoc(teamRef, {
        ...team,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  // Delete team
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }
};

// Games Service
export const gamesService = {
  // Get all games
  async getAll(): Promise<Game[]> {
    try {
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Game[];
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  // Get games by status
  async getByStatus(status: string): Promise<Game[]> {
    try {
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where('status', '==', status), orderBy('date'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Game[];
    } catch (error) {
      console.error('Error fetching games by status:', error);
      throw error;
    }
  },

  // Get game by ID
  async getById(id: string): Promise<Game | null> {
    try {
      const gameDoc = await getDoc(doc(db, 'games', id));
      if (gameDoc.exists()) {
        return {
          id: gameDoc.id,
          ...gameDoc.data(),
          date: gameDoc.data().date?.toDate(),
          createdAt: gameDoc.data().createdAt?.toDate(),
          updatedAt: gameDoc.data().updatedAt?.toDate()
        } as Game;
      }
      return null;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  // Create new game
  async create(game: Omit<Game, 'id'>, currentUser: string): Promise<string> {
    try {
      const gameData = {
        ...game,
        date: Timestamp.fromDate(game.date),
        createdAt: Timestamp.now(),
        createdBy: currentUser
      };
      
      const docRef = await addDoc(collection(db, 'games'), gameData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  // Update game
  async update(id: string, game: Partial<Game>, currentUser: string): Promise<void> {
    try {
      const gameRef = doc(db, 'games', id);
      const updateData: any = {
        ...game,
        updatedAt: Timestamp.now(),
        updatedBy: currentUser
      };
      
      if (game.date) {
        updateData.date = Timestamp.fromDate(game.date);
      }
      
      await updateDoc(gameRef, updateData);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  // Delete game
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'games', id));
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  },

  // Get games with player names
  async getAllWithPlayerNames(): Promise<Game[]> {
    try {
      const games = await this.getAll();
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      const playersMap = new Map<string, string>();
      
      playersSnapshot.docs.forEach(doc => {
        playersMap.set(doc.id, doc.data().name);
      });
      
      return games.map(game => ({
        ...game,
        playerAName: playersMap.get(game.playerA) || 'Unknown Player',
        playerBName: playersMap.get(game.playerB) || 'Unknown Player'
      }));
    } catch (error) {
      console.error('Error fetching games with player names:', error);
      throw error;
    }
  }
};

// Tournaments Service (updated for players)
export const tournamentsService = {
  // Get all tournaments
  async getAll(): Promise<Tournament[]> {
    try {
      const tournamentsRef = collection(db, 'tournaments');
      const q = query(tournamentsRef, orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Tournament[];
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
  },

  // Get tournament by ID
  async getById(id: string): Promise<Tournament | null> {
    try {
      const tournamentDoc = await getDoc(doc(db, 'tournaments', id));
      if (tournamentDoc.exists()) {
        return {
          id: tournamentDoc.id,
          ...tournamentDoc.data(),
          startDate: tournamentDoc.data().startDate?.toDate(),
          endDate: tournamentDoc.data().endDate?.toDate(),
          createdAt: tournamentDoc.data().createdAt?.toDate()
        } as Tournament;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw error;
    }
  },

  // Create new tournament
  async create(tournament: Omit<Tournament, 'id'>, currentUser: string): Promise<string> {
    try {
      const tournamentData = {
        ...tournament,
        startDate: Timestamp.fromDate(tournament.startDate),
        endDate: Timestamp.fromDate(tournament.endDate),
        createdAt: Timestamp.now(),
        createdBy: currentUser
      };
      
      const docRef = await addDoc(collection(db, 'tournaments'), tournamentData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  },

  // Update tournament
  async update(id: string, tournament: Partial<Tournament>): Promise<void> {
    try {
      const tournamentRef = doc(db, 'tournaments', id);
      const updateData: any = {
        ...tournament,
        updatedAt: Timestamp.now()
      };
      
      if (tournament.startDate) {
        updateData.startDate = Timestamp.fromDate(tournament.startDate);
      }
      
      if (tournament.endDate) {
        updateData.endDate = Timestamp.fromDate(tournament.endDate);
      }
      
      await updateDoc(tournamentRef, updateData);
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  },

  // Delete tournament
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tournaments', id));
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  },

  // Get tournaments with player names
  async getAllWithPlayerNames(): Promise<Tournament[]> {
    try {
      const tournaments = await this.getAll();
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      const playersMap = new Map<string, string>();
      
      playersSnapshot.docs.forEach(doc => {
        playersMap.set(doc.id, doc.data().name);
      });
      
      return tournaments.map(tournament => ({
        ...tournament,
        playerNames: tournament.players?.map((playerId: string) => playersMap.get(playerId) || 'Unknown Player') || []
      }));
    } catch (error) {
      console.error('Error fetching tournaments with player names:', error);
      throw error;
    }
  }
};

// Users Service (for admin user management)
export const usersService = {
  // Get all users
  async getAll(): Promise<any[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('username'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username,
        role: doc.data().role
        // Note: We don't return passwordHash for security
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};
