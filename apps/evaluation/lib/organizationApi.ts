// 組織管理アプリのAPIからデータを取得する機能

export interface OrganizationEmployee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  section: string;
  course?: string;
  employeeId: string;
  joinDate: string;
  birthDate: string;
  phone: string;
  qualificationGrade?: string;
}

export interface OrganizationData {
  name: string;
  employees: OrganizationEmployee[];
  departments: any[];
}

// 組織管理アプリからデータを取得（評価アプリのAPIルート経由）
export const fetchOrganizationData = async (): Promise<OrganizationData | null> => {
  try {
    // 評価アプリ自身のAPIルートを使用してCORSを回避
    const response = await fetch('/api/organization');
    if (!response.ok) {
      console.error('Failed to fetch organization data:', response.status);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching organization data:', error);
    return null;
  }
};

// 評価者の直属の部下を取得する関数
export const getDirectReports = (
  evaluatorId: string,
  organizationData: OrganizationData
): OrganizationEmployee[] => {
  const evaluator = organizationData.employees.find(emp => emp.id === evaluatorId);

  if (!evaluator) {
    return [];
  }

  const directReports: OrganizationEmployee[] = [];

  // 本部長の場合: 同じ本部の部長を取得
  if (evaluator.position.includes('本部長')) {
    directReports.push(
      ...organizationData.employees.filter(emp =>
        emp.department === evaluator.department &&
        emp.position.includes('部長') &&
        emp.id !== evaluator.id
      )
    );
  }

  // 部長の場合: 同じ部の課長を取得
  if (evaluator.position.includes('部長')) {
    directReports.push(
      ...organizationData.employees.filter(emp =>
        emp.department === evaluator.department &&
        emp.section === evaluator.section &&
        emp.position.includes('課長') &&
        emp.id !== evaluator.id
      )
    );
  }

  // 課長の場合: 同じ課の一般職を取得
  if (evaluator.position.includes('課長')) {
    directReports.push(
      ...organizationData.employees.filter(emp =>
        emp.department === evaluator.department &&
        emp.section === evaluator.section &&
        emp.course === evaluator.course &&
        !emp.position.includes('課長') &&
        !emp.position.includes('部長') &&
        !emp.position.includes('本部長') &&
        emp.id !== evaluator.id
      )
    );
  }

  return directReports;
};

// OrganizationEmployeeをEvaluateeに変換
export const convertToEvaluatee = (employee: OrganizationEmployee) => {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    image: null,
    position: employee.position,
    grade: employee.qualificationGrade || 'G3',
    weight1: 30, // デフォルトの重み
    weight2: 40,
    weight3: 30,
  };
};