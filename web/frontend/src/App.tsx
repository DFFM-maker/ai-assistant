import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import { ThemeProvider } from './hooks/useTheme';
import { ChatProvider } from './hooks/useChat';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';
import ChatPanel from './components/ChatPanel';
import './styles/themes.css';
import './styles.css';

function App() {
  const { user, loading, setUser } = useUser();

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    window.location.href = '/';
  };

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
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Layout user={user!} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard user={user!} />} />
              <Route path="dashboard" element={<Dashboard user={user!} />} />
              <Route path="chat" element={<ChatPanel />} />
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