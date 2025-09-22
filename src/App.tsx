import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CountdownTimer from './components/CountdownTimer';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/Home';
import Tournament from './pages/Tournament/Tournament';
import Players from './pages/Players/Players';
import PlayerDetails from './pages/PlayerDetails/PlayerDetails';
import Contact from './pages/Contact/Contact';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import Profile from './pages/Profile/Profile';
import MyGames from './pages/MyGames/MyGames';
import MyTournaments from './pages/MyTournaments/MyTournaments';
import PlayerDashboard from './pages/PlayerDashboard/PlayerDashboard';
import Games from './pages/Games/Games';
import Schedule from './pages/Schedule/Schedule';
import Users from './pages/Users/Users';

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  // SET YOUR TARGET DATE HERE - Change this to your desired launch date
  const targetDate = new Date('2025-09-25T10:00:00'); // Example: New Year's Eve 2024

  // Check if we've reached the target date
  const isLaunched = new Date() >= targetDate;

  // CONDITIONAL RENDERING: Show ONLY timer before launch, ONLY app after launch
  if (!isLaunched) {
    // BEFORE LAUNCH: Only show countdown timer (main app completely hidden from DOM)
    return (
      <div className="App">
        <CountdownTimer 
          targetDate={targetDate}
          title="The Court Awaits"
          subtitle="Moroccan Court Kings Championship is launching soon. Prepare for an epic basketball journey."
        />
      </div>
    );
  }

  // AFTER LAUNCH: Only show main app (countdown timer completely hidden from DOM)
  return (
    <div className="App">
      {currentUser && <Header />}
      <main className={currentUser ? "main-content" : "main-content-full"}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={!currentUser ? <Home /> : <Navigate to="/dashboard" />} />
          
          {/* Admin and Comando ONLY routes - NO PLAYERS ALLOWED */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="comando">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/players" element={
            <ProtectedRoute requiredRole="comando">
              <Players />
            </ProtectedRoute>
          } />
          <Route path="/players/:id" element={
            <ProtectedRoute requiredRole="comando">
              <PlayerDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/games" element={
            <ProtectedRoute requiredRole="comando">
              <Games />
            </ProtectedRoute>
          } />
          
          <Route path="/schedule" element={
            <ProtectedRoute requiredRole="comando">
              <Schedule />
            </ProtectedRoute>
          } />
          
          {/* Admin-only routes */}
          <Route path="/tournaments" element={
            <ProtectedRoute requiredRole="admin">
              <Tournament />
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={<Contact />} />
          <Route path="/create-account" element={<CreateAccount />} />
          
          {/* Player-specific pages */}
          <Route path="/player-dashboard" element={
            <ProtectedRoute requiredRole="player">
              <PlayerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-games" element={
            <ProtectedRoute requiredRole="player">
              <MyGames />
            </ProtectedRoute>
          } />
          <Route path="/my-tournaments" element={
            <ProtectedRoute requiredRole="player">
              <MyTournaments />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="player">
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect based on role */}
          <Route path="*" element={<Navigate to={
            currentUser 
              ? currentUser.role === 'player' 
                ? "/player-dashboard" 
                : "/dashboard"
              : "/"
          } />} />
        </Routes>
      </main>
      {currentUser && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
