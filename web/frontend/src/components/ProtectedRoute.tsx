import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // No authentication required - all routes are now public
  return <>{children}</>;
};

export default ProtectedRoute;