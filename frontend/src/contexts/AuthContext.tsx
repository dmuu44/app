import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const { user } = await authAPI.getProfile();
        setUser(user);
      } catch (error) {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const { user, token } = await authAPI.login(email, password);
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const register = async (userData: any) => {
    const { user, token } = await authAPI.register(userData);
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = async (userData: Partial<User>) => {
    const { user: updatedUser } = await authAPI.updateProfile(userData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};