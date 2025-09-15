'use client';

import { useState, useEffect } from 'react';
import ScoreSupportModal from './ScoreSupportModal';
import type { Evaluation } from '../lib/mockData';

interface EvaluationUpdate {
  score2?: number;
  score3?: number;
  comment2?: string;
  comment3?: string;
}

interface EvaluationModalProps {
  evaluation: Evaluation;
  type: 'score2' | 'score3';
  onClose: () => void;
  onUpdate: (evaluationId: string, data: EvaluationUpdate) => void;
}

export default function EvaluationModal({ evaluation, type, onClose, onUpdate }: EvaluationModalProps) {
  const [score, setScore] = useState<string>(
    type === 'score2'
      ? (evaluation.score2?.toString() || '')
      : (evaluation.score3?.toString() || '')
  );
  const [comment, setComment] = useState<string>(
    type === 'score2'
      ? (evaluation.comment2 || '')
      : (evaluation.comment3 || '')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showScoreSupport, setShowScoreSupport] = useState(false);

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

  const title = type === 'score2'
    ? '評価2: プロセス（個人利益貢献度）'
    : '評価3: 成長（自己成長および部下育成）';

  const handleSave = async () => {
    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      alert('スコアは0〜100の数値を入力してください');
      return;
    }

    setIsSaving(true);
    const data = type === 'score2'
      ? { score2: scoreValue, comment2: comment }
      : { score3: scoreValue, comment3: comment };

    await onUpdate(evaluation.id, data);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div
        className="rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{
          backgroundColor: isDark ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
          opacity: 1
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              対象者: {evaluation.evaluatee.name || evaluation.evaluatee.email}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              スコア (0-100)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0"
                max="100"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0-100"
              />
              <span className="text-gray-600 dark:text-gray-400">点</span>
              {type === 'score3' && (
                <button
                  type="button"
                  onClick={() => setShowScoreSupport(true)}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  スコア判定サポート
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              コメント（任意）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="評価の詳細やフィードバックを入力してください"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !score}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {showScoreSupport && (
        <ScoreSupportModal
          onClose={() => setShowScoreSupport(false)}
          onSave={(supportScore) => {
            setScore(supportScore.toString());
            setShowScoreSupport(false);
          }}
        />
      )}
    </div>
  );
}