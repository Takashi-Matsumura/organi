'use client'

import { useState } from 'react'
import { Employee, Organization, QualificationGrade } from '../types/organization'

interface EmployeeEditorProps {
  organization: Organization
  onDataUpdate: (newData: Organization) => void
}

export function EmployeeEditor({ organization, onDataUpdate }: EmployeeEditorProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Employee | null>(null)

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditing(false)
  }

  const startEditing = () => {
    if (selectedEmployee) {
      setEditForm({ ...selectedEmployee })
      setIsEditing(true)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  const saveEmployee = () => {
    if (!editForm) return

    const updatedOrganization = {
      ...organization,
      employees: organization.employees.map(emp =>
        emp.id === editForm.id ? editForm : emp
      )
    }

    onDataUpdate(updatedOrganization)
    setSelectedEmployee(editForm)
    setIsEditing(false)
    setEditForm(null)
  }

  const handleFormChange = (field: keyof Employee, value: string) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value === '' && field === 'qualificationGrade' ? undefined : value
      })
    }
  }

  const qualificationGrades: (QualificationGrade | '')[] = ['', 'SA', 'S4', 'S3', 'S2', 'S1', 'C3', 'C2', 'C1', 'E3', 'E2', 'E1']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 社員一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">社員一覧</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {organization.employees.map((employee) => (
            <button
              key={employee.id}
              onClick={() => handleEmployeeSelect(employee)}
              className={`w-full text-left p-3 rounded transition-colors ${
                selectedEmployee?.id === employee.id
                  ? 'bg-blue-100 border-blue-300'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-gray-600">
                {employee.position} - {employee.department}
                {employee.section && ` / ${employee.section}`}
                {employee.course && ` / ${employee.course}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 社員詳細・編集 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">社員詳細</h3>
          {selectedEmployee && !isEditing && (
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              編集
            </button>
          )}
        </div>

        {!selectedEmployee ? (
          <p className="text-gray-500">社員を選択してください</p>
        ) : isEditing && editForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
                <input
                  type="text"
                  value={editForm.position}
                  onChange={(e) => handleFormChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">本部</label>
                <select
                  value={editForm.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {organization.departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部</label>
                <input
                  type="text"
                  value={editForm.section}
                  onChange={(e) => handleFormChange('section', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">課</label>
                <input
                  type="text"
                  value={editForm.course || ''}
                  onChange={(e) => handleFormChange('course', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">社員番号</label>
                <input
                  type="text"
                  value={editForm.employeeId}
                  onChange={(e) => handleFormChange('employeeId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入社日</label>
                <input
                  type="date"
                  value={editForm.joinDate}
                  onChange={(e) => handleFormChange('joinDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
                <input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => handleFormChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">資格等級</label>
              <select
                value={editForm.qualificationGrade || ''}
                onChange={(e) => handleFormChange('qualificationGrade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {qualificationGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === '' ? '未設定' : grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={saveEmployee}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">氏名</label>
                <p className="text-gray-800 font-semibold">{selectedEmployee.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">役職</label>
                <p className="text-gray-800">{selectedEmployee.position}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">所属</label>
              <p className="text-gray-800">
                {selectedEmployee.department}
                {selectedEmployee.section && ` / ${selectedEmployee.section}`}
                {selectedEmployee.course && ` / ${selectedEmployee.course}`}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">メールアドレス</label>
                <p className="text-gray-800 text-sm">{selectedEmployee.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">電話番号</label>
                <p className="text-gray-800">{selectedEmployee.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">社員番号</label>
                <p className="text-gray-800">{selectedEmployee.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">入社日</label>
                <p className="text-gray-800">{selectedEmployee.joinDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">生年月日</label>
                <p className="text-gray-800">{selectedEmployee.birthDate}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">資格等級</label>
              <p className="text-gray-800">{selectedEmployee.qualificationGrade || '未設定'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}