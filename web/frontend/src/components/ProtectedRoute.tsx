import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'user' | 'unauthorized';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  if (role === 'unauthorized') {
    return (
      <div style={{ margin: '40px auto', textAlign: 'center', color: 'red' }}>
        <h2>🔒 Accesso non autorizzato</h2>
        <p>Effettua il login con Google per accedere.</p>
      </div>
    );
  }

  // Puoi aggiungere altre logiche per admin/user qui se vuoi!
  return <>{children}</>;
};

export default ProtectedRoute;