import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('notenest_token'));
  const [userStats, setUserStats] = useState({ uploads: 0, bookmarks: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user details on boot
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('notenest_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        if (res.stats) {
          setUserStats(res.stats);
        }
      } else {
        // Token invalid
        localStorage.removeItem('notenest_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Authentication token verification failed:', err.message);
      localStorage.removeItem('notenest_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('notenest_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('notenest_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('notenest_token');
    setToken(null);
    setUser(null);
    setUserStats({ uploads: 0, bookmarks: 0 });
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/me', profileData);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Failed to update profile');
  };

  const value = {
    user,
    token,
    userStats,
    isLoading,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && user.role === 'admin'),
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

