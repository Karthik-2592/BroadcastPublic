import React, { createContext, useContext, useState } from 'react';
import type { UserSummary } from '../types/api';
import { currentUserSummary } from '../data/mockData';

interface AuthContextType {
  isAuthenticated: boolean;
  isMember: boolean;
  currentUser: UserSummary | null;
  setCurrentUser: (user: UserSummary | null) => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock state: user is authenticated and is a member of the community
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isMember, setIsMember] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(currentUserSummary);

  const login = () => {
    setIsAuthenticated(true);
    setCurrentUser(currentUserSummary);
  };
  const logout = () => {
    setIsAuthenticated(false);
    setIsMember(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isMember, currentUser, setCurrentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
