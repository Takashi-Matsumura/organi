'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import EvaluateeList from '../../../components/EvaluateeList';
import EvaluationStats from '../../../components/EvaluationStats';
import { useEvaluatorAuth } from '../../../hooks/useEvaluatorAuth';

export default function EvaluatorDashboard() {
  const [isDark, setIsDark] = useState(false);
  const { currentEvaluator, isAuthenticated, isLoading, logout } = useEvaluatorAuth();
  const router = useRouter();

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
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

  if (!isAuthenticated || !currentEvaluator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-40 border-b border-gray-300 dark:border-gray-800"
        style={{
          backgroundColor: isDark ? 'rgb(15, 23, 42)' : 'rgb(229, 231, 235)',
          opacity: 1
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                人事評価ダッシュボード
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                評価期間: 2025年第1四半期 | {currentEvaluator.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 評価者情報表示 */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{currentEvaluator.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{currentEvaluator.position}</div>
                </div>
              </div>

              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                組織管理へ
              </a>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="ログアウト"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 統計セクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            評価統計
          </h2>
          <EvaluationStats />
        </div>

        {/* メインコンテンツ */}
        <div>
          <EvaluateeList />
        </div>
      </div>
    </div>
  );
}