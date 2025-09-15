'use client';

import { useEffect, useState } from 'react';
import { mockEvaluations } from '../lib/mockData';
import type { Evaluation } from '../lib/mockData';

export default function EvaluationStats() {
  const [evaluations] = useState<Evaluation[]>(mockEvaluations);

  const stats = {
    total: evaluations.length,
    completed: evaluations.filter(e => e.status === 'COMPLETED').length,
    inProgress: evaluations.filter(e => e.status === 'IN_PROGRESS').length,
    pending: evaluations.filter(e => e.status === 'PENDING').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 総数 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.total}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          総評価数
        </div>
      </div>

      {/* 完了 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.completed}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          完了
        </div>
      </div>

      {/* 進行中 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {stats.inProgress}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          進行中
        </div>
      </div>

      {/* 完了率 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {completionRate}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          完了率
        </div>
      </div>
    </div>
  );
}