import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { ChatProvider } from './hooks/useChat';
import { UserRoleProvider } from './hooks/useUserRole';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPanel from './components/ChatPanel';
import LoginWithGoogle from './components/LoginWithGoogle'; // <-- import
import './styles/themes.css';
import './styles.css';

function App() {
  // Temporarily set to admin for testing
  const [role, setRole] = useState<'admin' | 'user' | 'unauthorized'>('admin');

  return (
    <ThemeProvider>
      <ChatProvider>
        <UserRoleProvider role={role}>
          <Router>
            {/* Mostra login/logout sempre in alto, fuori dalle route */}
            <div style={{ position: 'fixed', top: 12, right: 24, zIndex: 1000 }}>
              <LoginWithGoogle onRoleChange={setRole} />
            </div>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute role={role}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="chat" element={<ChatPanel />} />
                {/* Add more routes here as needed */}
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </UserRoleProvider>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;