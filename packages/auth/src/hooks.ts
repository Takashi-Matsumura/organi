'use client';

import { useState, useEffect } from 'react';
import { verifyToken, isTokenExpired, TokenPayload } from './utils';

export const useTokenAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('authToken');

      if (!token || isTokenExpired(token)) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('authToken');
      } else {
        const decoded = verifyToken(token);
        if (decoded) {
          setIsAuthenticated(true);
          setUser(decoded);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('authToken');
        }
      }

      setIsLoading(false);
    };

    checkAuth();

    // トークンの有効期限をチェックするインターバル
    const interval = setInterval(checkAuth, 60000); // 1分ごと

    return () => clearInterval(interval);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded = verifyToken(token);
    if (decoded) {
      setIsAuthenticated(true);
      setUser(decoded);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };
};