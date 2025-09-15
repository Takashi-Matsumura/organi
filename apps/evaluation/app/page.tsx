'use client';

import { useEvaluatorAuth } from '../hooks/useEvaluatorAuth';
import EvaluatorLogin from '../components/EvaluatorLogin';
import { Evaluator } from '../lib/evaluators';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EvaluationRootPage() {
  const { isAuthenticated, isLoading, login } = useEvaluatorAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/evaluator/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = (evaluator: Evaluator) => {
    login(evaluator);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <EvaluatorLogin onLogin={handleLogin} />;
  }

  return null;
}