import React from 'react';
import { User } from '../types/User';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  loading: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user, loading }) => {
  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    // Inline login page
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Devi autenticarti</h2>
        <button
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#282c34',
            color: '#fff',
            border: 'none',
          }}
          onClick={() =>
            window.location.href =
            'http://192.168.1.250:4000/api/auth/gitlab'
          }
        >
          Login con GitLab
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;