import React, { useEffect } from 'react';
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
  const { user, loading, setUser } = useUser(); // setUser aggiunto!

  // Redirect automatico a GitLab se non autenticato
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = 'http://192.168.1.250:4000/api/auth/gitlab';
    }
  }, [user, loading]);

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
    setUser(null); // <-- Questo azzera lo stato utente!
    window.location.href = 'http://192.168.1.250:4000/api/auth/gitlab';
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
            {/* Eliminata la pagina di login */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Layout user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route index element={user ? <Dashboard user={user} /> : <div />} />
              <Route path="dashboard" element={user ? <Dashboard user={user} /> : <div />} />
              <Route path="chat" element={user ? <ChatPanel /> : <div />} />
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