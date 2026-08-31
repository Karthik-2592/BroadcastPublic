import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isMember: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
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
