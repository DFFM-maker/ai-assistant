import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import { ThemeProvider } from './hooks/useTheme';
import { ChatProvider } from './hooks/useChat';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';
import ChatPanel from './components/ChatPanel';
import './styles/themes.css';
import './styles.css';

function App() {
  const { user, loading } = useUser();

  // Logout function using React Router
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Logout failed');
      }
      // Navigation will be handled by the Header component
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show spinner during initial load
  if (loading) {
    return (
      <ThemeProvider>
        <Spinner />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Layout user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route index element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
              <Route path="dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
              <Route path="chat" element={user ? <ChatPanel /> : <Navigate to="/login" replace />} />
              {/* Add more protected routes here as needed */}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;