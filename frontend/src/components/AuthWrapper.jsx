import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';
import { X, AlertCircle } from 'lucide-react';

const AuthWrapper = ({ children }) => {
  const { user, isLoading, login, signup, error, clearError } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your Bug Diary...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show authentication screen
  if (!user) {
    const handleLogin = async (email, password) => {
      await login(email, password);
    };

    const handleSignup = async (name, email, password) => {
      await signup(name, email, password);
    };

    const handleSwitchToSignup = () => {
      clearError();
      setAuthMode('signup');
    };

    const handleSwitchToLogin = () => {
      clearError();
      setAuthMode('login');
    };

    return (
      <div className="relative">
        {/* Error Banner */}
        {error && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
              <button
                onClick={clearError}
                className="p-1 hover:bg-red-700 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        <div className={error ? 'mt-16' : ''}>
          {authMode === 'login' ? (
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={handleSwitchToSignup}
              loading={isLoading}
            />
          ) : (
            <Signup
              onSignup={handleSignup}
              onSwitchToLogin={handleSwitchToLogin}
              loading={isLoading}
            />
          )}
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return children;
};

export default AuthWrapper;