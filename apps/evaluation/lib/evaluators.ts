export interface Evaluator {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  section: string;
  course?: string;
  image?: string;
  role: 'evaluator' | 'manager';
}

// 組織管理アプリから取得した実際の管理職データ
export const mockEvaluators: Evaluator[] = [
  {
    id: 'emp1',
    name: '田中一郎',
    email: 'tanaka@organi.com',
    position: '本部長',
    department: '営業本部',
    section: '',
    course: '',
    role: 'manager',
  },
  {
    id: 'emp2',
    name: '佐藤次郎',
    email: 'sato@organi.com',
    position: '部長',
    department: '営業本部',
    section: '営業部',
    course: '',
    role: 'manager',
  },
  {
    id: 'emp4',
    name: '山田花子',
    email: 'yamada@organi.com',
    position: '課長',
    department: '営業本部',
    section: '営業部',
    course: '営業一課',
    role: 'evaluator',
  },
  {
    id: 'emp7',
    name: '鈴木太郎',
    email: 'suzuki@organi.com',
    position: '課長',
    department: '営業本部',
    section: '営業部',
    course: '営業二課',
    role: 'evaluator',
  },
  {
    id: 'emp11',
    name: '高橋健一',
    email: 'takahashi@organi.com',
    position: '本部長',
    department: 'システム本部',
    section: '',
    course: '',
    role: 'manager',
  },
  {
    id: 'emp12',
    name: '渡辺美穂',
    email: 'watanabe@organi.com',
    position: '部長',
    department: 'システム本部',
    section: 'システム開発部',
    course: '',
    role: 'manager',
  },
  {
    id: 'emp14',
    name: '伊藤隆',
    email: 'ito@organi.com',
    position: '課長',
    department: 'システム本部',
    section: 'システム開発部',
    course: 'システム開発一課',
    role: 'evaluator',
  },
  {
    id: 'emp17',
    name: '中村恵子',
    email: 'nakamura@organi.com',
    position: '課長',
    department: 'システム本部',
    section: 'システム開発部',
    course: 'システム開発二課',
    role: 'evaluator',
  },
  {
    id: 'emp21',
    name: '小林正雄',
    email: 'kobayashi@organi.com',
    position: '本部長',
    department: '人事本部',
    section: '',
    course: '',
    role: 'manager',
  },
  {
    id: 'emp22',
    name: '加藤明美',
    email: 'kato@organi.com',
    position: '部長',
    department: '人事本部',
    section: '人事部',
    course: '',
    role: 'manager',
  }
];

export const getEvaluatorById = (id: string): Evaluator | undefined => {
  return mockEvaluators.find(evaluator => evaluator.id === id);
};

export const getEvaluatorsByDepartment = (department: string): Evaluator[] => {
  return mockEvaluators.filter(evaluator => evaluator.department === department);
};