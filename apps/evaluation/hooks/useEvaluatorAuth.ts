'use client';

import { useState, useEffect } from 'react';
import { Evaluator } from '../lib/evaluators';

const STORAGE_KEY = 'evaluation_current_evaluator';

export function useEvaluatorAuth() {
  const [currentEvaluator, setCurrentEvaluator] = useState<Evaluator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const loadStoredEvaluator = () => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const evaluator = JSON.parse(stored);
            setCurrentEvaluator(evaluator);
          }
        } catch (error) {
          console.error('Failed to load stored evaluator:', error);
          localStorage.removeItem(STORAGE_KEY);
        } finally {
          setIsLoading(false);
        }
      };

      loadStoredEvaluator();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (evaluator: Evaluator) => {
    setCurrentEvaluator(evaluator);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluator));
    }
  };

  const logout = () => {
    setCurrentEvaluator(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isAuthenticated = currentEvaluator !== null;
  const isManager = currentEvaluator?.role === 'manager';

  return {
    currentEvaluator,
    isLoading,
    isAuthenticated,
    isManager,
    login,
    logout,
  };
}