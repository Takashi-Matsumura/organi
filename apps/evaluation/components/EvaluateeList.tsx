"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import EvaluationModal from "./EvaluationModal";
import type { Evaluation, Evaluatee } from "../lib/mockData";
import {
  calculateFinalScore,
  getStatusColor,
  getStatusText
} from "../lib/mockData";
import {
  fetchOrganizationData,
  getDirectReports,
  convertToEvaluatee
} from "../lib/organizationApi";
import { useEvaluatorAuth } from "../hooks/useEvaluatorAuth";

interface EvaluationUpdate {
  score2?: number;
  score3?: number;
  comment2?: string;
  comment3?: string;
}

export default function EvaluateeList() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [currentModal, setCurrentModal] = useState<{
    evaluation: Evaluation;
    type: 'score2' | 'score3';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentEvaluator } = useEvaluatorAuth();

  useEffect(() => {
    const loadEvaluations = async () => {
      if (!currentEvaluator) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 組織データを取得
        const organizationData = await fetchOrganizationData();

        if (organizationData) {
          // 現在の評価者の直属の部下を取得
          const directReports = getDirectReports(currentEvaluator.id, organizationData);

          // 被評価者データに変換
          const evaluatees = directReports.map(convertToEvaluatee);

          // 評価データを生成
          const generatedEvaluations: Evaluation[] = evaluatees.map((evaluatee, index) => ({
            id: `evaluation-${evaluatee.id}`,
            evaluatorId: currentEvaluator.id,
            evaluateeId: evaluatee.id,
            status: index === 0 ? "IN_PROGRESS" : index === 1 ? "PENDING" : "COMPLETED",
            period: '2025Q1',
            score1: 75 + (index * 5), // 結果評価（固定値）
            score2: index === 2 ? 80 : index === 0 ? 85 : null, // プロセス評価
            score3: index === 2 ? 75 : null, // 成長評価
            comment2: index === 0 ? 'プロジェクト推進において積極的な姿勢が見られました。' :
                     index === 2 ? 'チームワークを大切にし、効率的な業務遂行ができています。' : null,
            comment3: index === 2 ? 'スキル向上に積極的で、後輩指導も優秀です。' : null,
            category3: index === 2 ? 'スキル向上' : null,
            achievement3: index === 2 ? 'プログラミング技術の向上' : null,
            projectData2: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            evaluatee: evaluatee,
          }));

          setEvaluations(generatedEvaluations);
        } else {
          // フォールバック: 組織データが取得できない場合は空にする
          setEvaluations([]);
        }
      } catch (error) {
        console.error('Failed to load evaluations:', error);
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, [currentEvaluator]);

  const handleUpdateEvaluation = async (evaluationId: string, data: EvaluationUpdate) => {
    try {
      // モックデータの更新
      setEvaluations(prev => prev.map(evaluation => {
        if (evaluation.id === evaluationId) {
          const updated = {
            ...evaluation,
            ...data,
            status: (data.score2 !== undefined && data.score3 !== undefined)
              ? 'COMPLETED' as const
              : 'IN_PROGRESS' as const,
            updatedAt: new Date().toISOString()
          };
          return updated;
        }
        return evaluation;
      }));

      setCurrentModal(null);
    } catch (error) {
      console.error('評価更新エラー:', error);
      alert('評価の保存に失敗しました。');
    }
  };

  const renderScoreButton = (evaluation: Evaluation, type: 'score2' | 'score3') => {
    const score = type === 'score2' ? evaluation.score2 : evaluation.score3;
    const label = type === 'score2' ? 'プロセス' : '成長';

    return (
      <button
        onClick={() => setCurrentModal({ evaluation, type })}
        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
          score !== null
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`}
      >
        {score !== null ? `${label}: ${score}点` : `${label}評価`}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          被評価者一覧 ({evaluations.length}人)
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          評価期間: 2025年第1四半期
        </div>
      </div>

      {/* 評価一覧 */}
      <div className="space-y-4">
        {evaluations.map((evaluation) => {
          const finalScore = calculateFinalScore(evaluation);

          return (
            <div
              key={evaluation.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {/* アバター */}
                  <div className="flex-shrink-0">
                    {evaluation.evaluatee.image ? (
                      <Image
                        src={evaluation.evaluatee.image}
                        alt={evaluation.evaluatee.name || ''}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                          {evaluation.evaluatee.name?.charAt(0) || evaluation.evaluatee.email.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 基本情報 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {evaluation.evaluatee.name || evaluation.evaluatee.email}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
                      <span>{evaluation.evaluatee.position}</span>
                      <span>{evaluation.evaluatee.grade}</span>
                      <span>{evaluation.evaluatee.email}</span>
                    </div>
                  </div>
                </div>

                {/* ステータス */}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                    {getStatusText(evaluation.status)}
                  </span>
                </div>
              </div>

              {/* 重み配分表示 */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  評価重み配分:
                </div>
                <div className="flex space-x-6 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    結果: {evaluation.evaluatee.weight1}%
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    プロセス: {evaluation.evaluatee.weight2}%
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    成長: {evaluation.evaluatee.weight3}%
                  </span>
                </div>
              </div>

              {/* 評価スコア */}
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 結果評価（固定値） */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="text-sm text-gray-600 dark:text-gray-400">結果評価</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {evaluation.score1}点
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      (固定値)
                    </div>
                  </div>

                  {/* プロセス評価 */}
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">プロセス評価</div>
                    {renderScoreButton(evaluation, 'score2')}
                  </div>

                  {/* 成長評価 */}
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">成長評価</div>
                    {renderScoreButton(evaluation, 'score3')}
                  </div>

                  {/* 最終スコア */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="text-sm text-blue-600 dark:text-blue-400">最終スコア</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {finalScore !== null ? `${finalScore}点` : '算出中'}
                    </div>
                  </div>
                </div>

                {/* コメント表示 */}
                {(evaluation.comment2 || evaluation.comment3) && (
                  <div className="mt-3 space-y-2">
                    {evaluation.comment2 && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                          プロセス評価コメント
                        </div>
                        <div className="text-sm text-green-800 dark:text-green-200 mt-1">
                          {evaluation.comment2}
                        </div>
                      </div>
                    )}
                    {evaluation.comment3 && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                        <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                          成長評価コメント
                        </div>
                        <div className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                          {evaluation.comment3}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 評価モーダル */}
      {currentModal && (
        <EvaluationModal
          evaluation={currentModal.evaluation}
          type={currentModal.type}
          onClose={() => setCurrentModal(null)}
          onUpdate={handleUpdateEvaluation}
        />
      )}
    </div>
  );
}