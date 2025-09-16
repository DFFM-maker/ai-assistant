import React from 'react';
import { Outlet } from 'react-router-dom';
import { User } from '../types/User';
import Header from './Header';
import Sidebar from './Sidebar';
import VersionPanel from './VersionPanel';
import './Layout.css';

interface LayoutProps {
  user: User | null;
  onLogout: () => Promise<void>;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="app-layout">
      <Header user={user} onLogout={onLogout} />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <VersionPanel />
    </div>
  );
};

export default Layout;