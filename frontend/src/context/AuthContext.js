import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setLogoutCallback } from '../services/api';
import { wsService } from '../services/websocket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          const profile = await api.getMyProfile(savedToken);
          if (profile.id) {
            setUser(profile);
            wsService.connect(savedToken); // ← WebSocket connect
          } else {
            await logout();
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.access_token) {
      await AsyncStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      const profile = await api.getMyProfile(data.access_token);
      setUser(profile);
      wsService.connect(data.access_token); // ← WebSocket connect
      return { success: true };
    }
    return { success: false, error: data.error || data.detail || 'Login failed' };
  };

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password });
    if (data.id) return await login(email, password);
    const errorMsg = Array.isArray(data.detail)
      ? data.detail.map(e => e.msg).join(', ')
      : data.error || data.detail || 'Register failed';
    return { success: false, error: errorMsg };
  };

  const logout = async () => {
    wsService.disconnect(); // ← WebSocket disconnect
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);