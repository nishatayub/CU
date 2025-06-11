import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('codeunity_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const BACKEND_URL = import.meta.env.PROD 
        ? 'https://cu-669q.onrender.com'
        : 'http://localhost:8080';

      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('codeunity_token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('codeunity_token');
    } finally {
      setLoading(false);
    }
  };

  const linkAccount = async (username, provider, providerData) => {
    try {
      const BACKEND_URL = import.meta.env.PROD 
        ? 'https://cu-669q.onrender.com'
        : 'http://localhost:8080';

      const response = await fetch(`${BACKEND_URL}/api/auth/link-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          provider,
          providerData
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('codeunity_token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error linking account:', error);
      return { success: false, message: 'Failed to link account' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('codeunity_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const getAuthStatus = async (username) => {
    try {
      const BACKEND_URL = import.meta.env.PROD 
        ? 'https://cu-669q.onrender.com'
        : 'http://localhost:8080';

      const response = await fetch(`${BACKEND_URL}/api/auth/status/${username}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting auth status:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    linkAccount,
    signOut,
    getAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
