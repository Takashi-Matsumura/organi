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