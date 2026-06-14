import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = '/api';

// Configure axios defaults
axios.defaults.baseURL = '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('bug-diary-token');
  };

  // Set token in localStorage and axios headers
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('bug-diary-token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('bug-diary-token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Clear error after a delay
  const clearErrorAfterDelay = () => {
    setTimeout(() => setError(null), 5000);
  };

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verify token by fetching current user
        const response = await axios.get(`${API_BASE_URL}/auth/me`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Token validation failed:', error);
        // Clear invalid token
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = response.data;

      // Store token and user
      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);

      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      clearErrorAfterDelay();

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name,
        email,
        password
      });

      const { user, token } = response.data;

      // Store token and user
      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);

      const errorMessage = error.response?.data?.error || 'Account creation failed. Please try again.';
      setError(errorMessage);
      clearErrorAfterDelay();

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (name, email) => {
    try {
      setError(null);

      const response = await axios.put(`${API_BASE_URL}/auth/me`, {
        name,
        email
      });

      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Profile update error:', error);

      const errorMessage = error.response?.data?.error || 'Profile update failed. Please try again.';
      setError(errorMessage);
      clearErrorAfterDelay();

      throw new Error(errorMessage);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!getToken();
  };

  // Clear errors manually
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;