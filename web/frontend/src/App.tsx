import React, { useEffect, useState } from 'react';
import LoginGitlab from './LoginGitlab';

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <div>
      <h1>AI Assistant</h1>
      {user ? (
        <div>
          <img src={user.avatar} alt="avatar" width={32} style={{ borderRadius: '50%' }} />
          <strong>{user.name} ({user.username})</strong>
          <a href="/api/auth/logout"><button>Logout</button></a>
        </div>
      ) : (
        <LoginGitlab />
      )}
    </div>
  );
}

export default App;
