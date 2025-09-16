import React from 'react';
import { Navigate } from 'react-router-dom';
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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;