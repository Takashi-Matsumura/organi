'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaTimes } from 'react-icons/fa';
import { mockEvaluators, Evaluator } from '../lib/evaluators';

interface EvaluatorLoginProps {
  onLogin: (evaluator: Evaluator) => void;
}

export default function EvaluatorLogin({ onLogin }: EvaluatorLoginProps) {
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState<Evaluator | null>(null);
  const [isDark, setIsDark] = useState(false);

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

  const handleEvaluatorSelect = (evaluator: Evaluator) => {
    setSelectedEvaluator(evaluator);
    setShowEvaluatorModal(false);
    onLogin(evaluator);
  };

  const getDepartmentGroups = () => {
    const groups: Record<string, Evaluator[]> = {};
    mockEvaluators.forEach(evaluator => {
      if (!groups[evaluator.department]) {
        groups[evaluator.department] = [];
      }
      groups[evaluator.department].push(evaluator);
    });
    return groups;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'evaluator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'manager':
        return '管理者';
      case 'evaluator':
        return '評価者';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <FaUser className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ORGANI - 人事評価システム
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            評価者としてログインしてください
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {/* 評価者選択ボタン */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                評価者を選択
              </label>
              <button
                onClick={() => setShowEvaluatorModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 text-gray-400 mr-3" />
                  <span>
                    {selectedEvaluator ? selectedEvaluator.name : '評価者を選択してください'}
                  </span>
                </div>
                <div className="text-gray-400">
                  ▼
                </div>
              </button>
            </div>

            {selectedEvaluator && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {selectedEvaluator.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(selectedEvaluator.role)}`}>
                    {getRoleText(selectedEvaluator.role)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center">
                    <FaBuilding className="w-3 h-3 mr-2" />
                    {selectedEvaluator.department}
                    {selectedEvaluator.section && ` / ${selectedEvaluator.section}`}
                    {selectedEvaluator.course && ` / ${selectedEvaluator.course}`}
                  </div>
                  <div>{selectedEvaluator.position}</div>
                  <div>{selectedEvaluator.email}</div>
                </div>
              </div>
            )}

            {/* ログインボタン */}
            <button
              onClick={() => selectedEvaluator && handleEvaluatorSelect(selectedEvaluator)}
              disabled={!selectedEvaluator}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                selectedEvaluator
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              ログイン
            </button>
          </div>

          {/* 組織管理アプリへのリンク */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                組織管理アプリを開く →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 評価者選択モーダル */}
      {showEvaluatorModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                評価者を選択
              </h3>
              <button
                onClick={() => setShowEvaluatorModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* モーダル内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {Object.entries(getDepartmentGroups()).map(([department, evaluators]) => (
                <div key={department} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <FaBuilding className="w-4 h-4 mr-2" />
                    {department}
                  </h4>
                  <div className="grid gap-3">
                    {evaluators.map(evaluator => (
                      <button
                        key={evaluator.id}
                        onClick={() => handleEvaluatorSelect(evaluator)}
                        className="text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {evaluator.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(evaluator.role)}`}>
                            {getRoleText(evaluator.role)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div>{evaluator.position}</div>
                          <div className="mt-1">
                            {evaluator.section && `${evaluator.section}`}
                            {evaluator.course && ` / ${evaluator.course}`}
                          </div>
                          <div className="mt-1">{evaluator.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}