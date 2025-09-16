import React from 'react';
import { useUser } from './hooks/useUser';
import UserPanel from './components/UserPanel';
import './styles.css';

function App() {
  const { user, loading } = useUser();

  // Funzione di logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include', // Necessario se usi cookie di sessione
      });
      if (response.ok) {
        window.location.href = 'http://localhost:4000/login'; // Cambia se la tua login è altrove
      } else {
        alert('Errore durante il logout dal server.');
      }
    } catch (error) {
      alert('Errore di rete: ' + error);
    }
  };

  return (
    <div className="app">
      <UserPanel user={user} loading={loading} />
      <div className="main-content">
        <h1>AI Assistant</h1>
        {user ? (
          <div>
            <p>Welcome back, {user.name}!</p>
            {/* Main application content goes here */}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>Please log in to access the AI Assistant.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;