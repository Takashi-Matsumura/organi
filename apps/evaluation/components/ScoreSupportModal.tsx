'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ScoreSupportModalProps {
  onClose: () => void;
  onSave: (score: number) => void;
}

interface Category {
  id: string;
  name: string;
  target: string;
  coefficient: number;
  scores: {
    T4: number;
    T3: number;
    T2: number;
    T1: number;
  };
}

interface ProjectAchievement {
  level: string;
  title: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'skill',
    name: 'スキル向上',
    target: '日常業務を高度化・効率化する技術・手法の習得',
    coefficient: 1.0,
    scores: { T4: 120, T3: 100, T2: 80, T1: 50 }
  },
  {
    id: 'qualification',
    name: '資格取得',
    target: '国家資格・ベンダー資格などの客観的証明の取得',
    coefficient: 1.1,
    scores: { T4: 130, T3: 110, T2: 90, T1: 60 }
  },
  {
    id: 'knowledge',
    name: '知識深化',
    target: '業界・学術知識の体系的深化／社内外への発信',
    coefficient: 1.0,
    scores: { T4: 120, T3: 100, T2: 80, T1: 50 }
  },
  {
    id: 'leadership',
    name: 'リーダーシップ',
    target: 'チーム運営・プロジェクト管理・メンバー指導',
    coefficient: 1.2,
    scores: { T4: 140, T3: 120, T2: 95, T1: 70 }
  }
];

const projectAchievements: ProjectAchievement[] = [
  { level: 'T4', title: '変革級', description: '組織全体に影響を与える変革的な成果' },
  { level: 'T3', title: '優秀級', description: '部門を越えた成果・他への波及効果' },
  { level: 'T2', title: '標準級', description: '担当業務の確実な遂行・期待通りの成果' },
  { level: 'T1', title: '基礎級', description: '基本的な業務遂行・最低限の成果' }
];

export default function ScoreSupportModal({ onClose, onSave }: ScoreSupportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
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

  const calculateScore = useCallback(() => {
    if (!selectedCategory || !selectedLevel) {
      setCalculatedScore(0);
      return;
    }

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) {
      setCalculatedScore(0);
      return;
    }

    const baseScore = category.scores[selectedLevel as keyof typeof category.scores];
    const finalScore = Math.min(100, Math.round(baseScore * category.coefficient));
    setCalculatedScore(finalScore);
  }, [selectedCategory, selectedLevel]);

  useEffect(() => {
    calculateScore();
  }, [calculateScore]);

  const handleSave = () => {
    if (calculatedScore > 0) {
      onSave(calculatedScore);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110]">
      <div
        className="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: isDark ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              成長評価スコア判定サポート
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* カテゴリ選択 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                1. 成長カテゴリを選択
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="text-blue-600"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (×{category.coefficient})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 達成レベル選択 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                2. 達成レベルを選択
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectAchievements.map((achievement) => (
                  <div
                    key={achievement.level}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedLevel === achievement.level
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedLevel(achievement.level)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        checked={selectedLevel === achievement.level}
                        onChange={() => setSelectedLevel(achievement.level)}
                        className="text-green-600"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {achievement.level}: {achievement.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                    {selectedCategory && (
                      <div className="mt-2 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">
                          基礎スコア: {categories.find(c => c.id === selectedCategory)?.scores[achievement.level as keyof typeof categories[0]['scores']] || 0}点
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 計算結果表示 */}
            {calculatedScore > 0 && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                  計算結果
                </h3>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {calculatedScore}点
                </div>
                {selectedCategory && selectedLevel && (
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    {categories.find(c => c.id === selectedCategory)?.name} × {selectedLevel}レベル × 係数{categories.find(c => c.id === selectedCategory)?.coefficient}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={calculatedScore === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              このスコアを使用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}