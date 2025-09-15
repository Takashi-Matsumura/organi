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

export interface EvaluationUpdate {
  score2?: number;
  score3?: number;
  comment2?: string;
  comment3?: string;
}

export interface Category {
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

export interface ProjectAchievement {
  level: string;
  title: string;
  description: string;
}