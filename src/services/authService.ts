import { signOut } from 'firebase/auth';
import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs,
  setDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, UserDocument } from '../types';

class AuthService {
  // Custom authentication since Firebase doesn't support username/password directly
  async login(username: string, password: string): Promise<User> {
    try {
      console.log('🔐 Login attempt:', { username });
      
      // Query user by username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      console.log('📊 Query result:', {
        isEmpty: querySnapshot.empty,
        size: querySnapshot.size,
        docs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
      
      if (querySnapshot.empty) {
        console.error('❌ No user found with username:', username);
        throw new Error('Invalid username or password');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as UserDocument;
      
      console.log('👤 User found:', { 
        id: userDoc.id, 
        username: userData.username, 
        role: userData.role,
        hasPasswordHash: !!userData.passwordHash 
      });
      
      // Verify password (temporarily using plaintext for debugging)
      console.log('🔒 Comparing passwords...');
      console.log('  - Entered password:', password);
      console.log('  - Stored password:', userData.passwordHash);
      const isPasswordValid = password === userData.passwordHash;
      console.log('✅ Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.error('❌ Password mismatch for user:', username);
        throw new Error('Invalid username or password');
      }

      // Create custom user object for our app
      const user: User = {
        id: userDoc.id,
        username: userData.username,
        role: userData.role
      };

      // Store user in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('currentUser');
      // If using Firebase auth, also sign out
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      return JSON.parse(userString) as User;
    }
    return null;
  }

  // Admin function to create new users
  async createUser(username: string, password: string, role: 'admin' | 'comando' | 'player'): Promise<void> {
    try {
      // Check if username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Username already exists');
      }

      // Store password as plaintext (temporarily for debugging)
      const passwordHash = password;

      // Create user document
      const userDoc: UserDocument = {
        username,
        passwordHash,
        role
      };

      // Add to Firestore
      const newUserRef = doc(collection(db, 'users'));
      await setDoc(newUserRef, userDoc);

      console.log('User created successfully');
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Check if user has required role
  hasRole(user: User | null, requiredRole: 'admin' | 'comando' | 'player'): boolean {
    if (!user) return false;
    if (requiredRole === 'player') {
      return user.role === 'admin' || user.role === 'comando' || user.role === 'player';
    }
    if (requiredRole === 'comando') {
      return user.role === 'admin' || user.role === 'comando';
    }
    return user.role === requiredRole;
  }

  // Check if user can perform action
  canPerformAction(user: User | null, action: 'create' | 'update' | 'delete', resource: 'players' | 'games' | 'tournaments' | 'profile'): boolean {
    if (!user) return false;

    if (user.role === 'admin') {
      return true; // Admin can do everything
    }

    if (user.role === 'comando') {
      switch (resource) {
        case 'players':
          return true; // Comandos can manage players
        case 'games':
          return action === 'create' || action === 'update';
        case 'tournaments':
          return false; // Comandos cannot manage tournaments
        case 'profile':
          return action === 'update'; // Can update own profile
        default:
          return false;
      }
    }

    if (user.role === 'player') {
      switch (resource) {
        case 'players':
          return false; // Players CANNOT manage other players AT ALL
        case 'games':
          return false; // Players CANNOT manage games (read-only access only)
        case 'tournaments':
          return false; // Players CANNOT manage tournaments (read-only access only)
        case 'profile':
          return action === 'update'; // Can ONLY update their own profile
        default:
          return false;
      }
    }

    return false;
  }

  // Check if user can access administrative features
  canAccessAdmin(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'comando';
  }

  // Check if user should be restricted to player-only pages
  isPlayerOnly(user: User | null): boolean {
    return user?.role === 'player';
  }
}

export const authService = new AuthService();
