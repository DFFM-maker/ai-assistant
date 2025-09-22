import React, { createContext, useContext, ReactNode } from 'react';

export type UserRole = 'admin' | 'user' | 'unauthorized';

interface UserRoleContextType {
  role: UserRole;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

interface UserRoleProviderProps {
  children: ReactNode;
  role: UserRole;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ children, role }) => {
  return (
    <UserRoleContext.Provider value={{ role }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};