import React from 'react';
import { Outlet } from 'react-router-dom';
import { User } from '../types/User';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

interface LayoutProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <div className="content-area">
        <Header user={user} onLogout={onLogout} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;