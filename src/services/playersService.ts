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
import { Player, Game, Tournament, PlayerStats, PlayerTournamentHistory } from '../types';

// Players Service
export const playersService = {
  // Get all players
  async getAll(): Promise<Player[]> {
    try {
      const playersRef = collection(db, 'players');
      const q = query(playersRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Player[];
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  // Get player by ID
  async getById(id: string): Promise<Player | null> {
    try {
      const playerDoc = await getDoc(doc(db, 'players', id));
      if (playerDoc.exists()) {
        return {
          id: playerDoc.id,
          ...playerDoc.data(),
          createdAt: playerDoc.data().createdAt?.toDate(),
          updatedAt: playerDoc.data().updatedAt?.toDate()
        } as Player;
      }
      return null;
    } catch (error) {
      console.error('Error fetching player:', error);
      throw error;
    }
  },

  // Create player
  async create(playerData: Omit<Player, 'id'>, createdBy: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'players'), {
        ...playerData,
        createdAt: Timestamp.now(),
        createdBy
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  },

  // Update player
  async update(id: string, playerData: Partial<Player>, updatedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'players', id), {
        ...playerData,
        updatedAt: Timestamp.now(),
        updatedBy
      });
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  // Delete player
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },

  // Get player tournament history
  async getTournamentHistory(playerId: string): Promise<PlayerTournamentHistory[]> {
    try {
      // Get all tournaments this player participated in
      const tournamentsRef = collection(db, 'tournaments');
      const tournamentsQuery = query(tournamentsRef, where('players', 'array-contains', playerId));
      const tournamentsSnapshot = await getDocs(tournamentsQuery);
      
      const history: PlayerTournamentHistory[] = [];
      
      for (const tournamentDoc of tournamentsSnapshot.docs) {
        const tournament = {
          id: tournamentDoc.id,
          ...tournamentDoc.data(),
          startDate: tournamentDoc.data().startDate?.toDate(),
          endDate: tournamentDoc.data().endDate?.toDate(),
          createdAt: tournamentDoc.data().createdAt?.toDate(),
          updatedAt: tournamentDoc.data().updatedAt?.toDate()
        } as Tournament;

        // Get all games for this player in this tournament
        const gamesRef = collection(db, 'games');
        const gamesQueryA = query(
          gamesRef,
          where('tournamentId', '==', tournament.id),
          where('playerA', '==', playerId)
        );
        const gamesQueryB = query(
          gamesRef,
          where('tournamentId', '==', tournament.id),
          where('playerB', '==', playerId)
        );
        
        const [gamesSnapshotA, gamesSnapshotB] = await Promise.all([
          getDocs(gamesQueryA),
          getDocs(gamesQueryB)
        ]);
        
        const games = [...gamesSnapshotA.docs, ...gamesSnapshotB.docs].map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        })) as Game[];

        // Calculate stats
        const stats = this.calculatePlayerStats(playerId, tournament.id, games);
        
        history.push({
          tournament,
          stats,
          games
        });
      }
      
      return history;
    } catch (error) {
      console.error('Error fetching player tournament history:', error);
      throw error;
    }
  },

  // Calculate player statistics
  calculatePlayerStats(playerId: string, tournamentId: string, games: Game[]): PlayerStats {
    const playerGames = games.filter(game => 
      game.playerA === playerId || game.playerB === playerId
    );

    let wins = 0;
    let losses = 0;
    let totalPointsScored = 0;

    playerGames.forEach(game => {
      if (game.status === 'completed') {
        const isPlayerA = game.playerA === playerId;
        const playerScore = isPlayerA ? game.scoreA : game.scoreB;
        const opponentScore = isPlayerA ? game.scoreB : game.scoreA;
        
        totalPointsScored += playerScore;
        
        if (playerScore > opponentScore) {
          wins++;
        } else {
          losses++;
        }
      }
    });

    const gamesPlayed = wins + losses;
    const averagePointsPerGame = gamesPlayed > 0 ? totalPointsScored / gamesPlayed : 0;
    const winRatio = gamesPlayed > 0 ? wins / gamesPlayed : 0;

    return {
      playerId,
      tournamentId,
      gamesPlayed,
      wins,
      losses,
      totalPointsScored,
      averagePointsPerGame,
      winRatio
    };
  }
};
