import React, { createContext, useState, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.access_token) {
      setToken(data.access_token);
      const profile = await api.getMyProfile(data.access_token);
      setUser(profile);
      return { success: true };
    }
    return { success: false, error: data.detail };
  };

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password });
    if (data.id) {
      return await login(email, password);
    }
    return { success: false, error: data.detail };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);