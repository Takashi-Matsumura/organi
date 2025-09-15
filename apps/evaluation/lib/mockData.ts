export interface Evaluatee {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  position: string | null;
  grade: string | null;
  weight1: number; // 結果評価の重み
  weight2: number; // プロセス評価の重み
  weight3: number; // 成長評価の重み
}

export interface ProjectData {
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  checklist: boolean[];
  classType: 'A' | 'C' | null;
  achievement: string | null;
  score: number | null;
}

export interface Evaluation {
  id: string;
  evaluatorId: string;
  evaluateeId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  period: string;
  score1: number | null; // 結果評価スコア
  score2: number | null; // プロセス評価スコア
  score3: number | null; // 成長評価スコア
  comment2: string | null; // プロセス評価コメント
  comment3: string | null; // 成長評価コメント
  category3: string | null; // 成長評価カテゴリ
  achievement3: string | null; // 成長評価実績
  projectData2: ProjectData | null; // プロジェクト評価データ
  createdAt: string;
  updatedAt: string;
  evaluatee: Evaluatee;
}

// モック被評価者データ
export const mockEvaluatees: Evaluatee[] = [
  {
    id: 'eval-1',
    name: '田中 太郎',
    email: 'tanaka@example.com',
    image: null,
    position: '主任',
    grade: 'G4',
    weight1: 30,
    weight2: 40,
    weight3: 30,
  },
  {
    id: 'eval-2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    image: null,
    position: '一般職',
    grade: 'G3',
    weight1: 35,
    weight2: 35,
    weight3: 30,
  },
  {
    id: 'eval-3',
    name: '山田 次郎',
    email: 'yamada@example.com',
    image: null,
    position: '一般職',
    grade: 'G2',
    weight1: 40,
    weight2: 30,
    weight3: 30,
  }
];

// モック評価データ
export const mockEvaluations: Evaluation[] = [
  {
    id: 'evaluation-1',
    evaluatorId: 'evaluator-1',
    evaluateeId: 'eval-1',
    status: 'IN_PROGRESS',
    period: '2025Q1',
    score1: 75, // 結果評価（固定値）
    score2: 80, // プロセス評価
    score3: null, // 成長評価（未設定）
    comment2: 'プロジェクト推進において積極的な姿勢が見られました。',
    comment3: null,
    category3: null,
    achievement3: null,
    projectData2: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evaluatee: mockEvaluatees[0],
  },
  {
    id: 'evaluation-2',
    evaluatorId: 'evaluator-1',
    evaluateeId: 'eval-2',
    status: 'PENDING',
    period: '2025Q1',
    score1: 70, // 結果評価（固定値）
    score2: null, // プロセス評価（未設定）
    score3: null, // 成長評価（未設定）
    comment2: null,
    comment3: null,
    category3: null,
    achievement3: null,
    projectData2: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evaluatee: mockEvaluatees[1],
  },
  {
    id: 'evaluation-3',
    evaluatorId: 'evaluator-1',
    evaluateeId: 'eval-3',
    status: 'COMPLETED',
    period: '2025Q1',
    score1: 85, // 結果評価（固定値）
    score2: 75, // プロセス評価
    score3: 80, // 成長評価
    comment2: 'チームワークを大切にし、効率的な業務遂行ができています。',
    comment3: 'スキル向上に積極的で、後輩指導も優秀です。',
    category3: 'スキル向上',
    achievement3: 'プログラミング技術の向上',
    projectData2: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evaluatee: mockEvaluatees[2],
  }
];

// 最終スコア計算
export const calculateFinalScore = (evaluation: Evaluation): number | null => {
  const { score1, score2, score3, evaluatee } = evaluation;

  if (score1 === null || score2 === null || score3 === null) {
    return null;
  }

  const { weight1, weight2, weight3 } = evaluatee;
  const totalWeight = weight1 + weight2 + weight3;

  return Math.round(
    (score1 * weight1 + score2 * weight2 + score3 * weight3) / totalWeight
  );
};

// 評価ステータス色
export const getStatusColor = (status: Evaluation['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'PENDING':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 評価ステータス表示名
export const getStatusText = (status: Evaluation['status']) => {
  switch (status) {
    case 'COMPLETED':
      return '完了';
    case 'IN_PROGRESS':
      return '進行中';
    case 'PENDING':
      return '未着手';
    default:
      return '不明';
  }
};