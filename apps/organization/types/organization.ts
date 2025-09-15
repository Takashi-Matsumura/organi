export type QualificationGrade = 'SA' | 'S4' | 'S3' | 'S2' | 'S1' | 'C3' | 'C2' | 'C1' | 'G1' | 'G2' | 'G3' | 'E3' | 'E2' | 'E1'

export interface Employee {
  id: string
  name: string
  position: string
  department: string
  section: string
  course?: string
  email: string
  phone: string
  employeeId: string
  joinDate: string
  birthDate: string
  qualificationGrade?: QualificationGrade // 資格等級
  evaluatorId?: string // 評価者のID（任意）
  evaluator?: string // 評価者の名前（任意）
  isEvaluator?: boolean // 評価担当フラグ（任意、デフォルトは管理職でtrue）
}

export interface Department {
  id: string
  name: string
  manager: string
  managerId: string
  sections: Section[]
}

export interface Section {
  id: string
  name: string
  manager: string
  managerId: string
  courses: Course[]
}

export interface Course {
  id: string
  name: string
  manager: string
  managerId: string
}

export interface Organization {
  id: string
  name: string
  departments: Department[]
  employees: Employee[]
}