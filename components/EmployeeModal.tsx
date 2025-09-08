'use client'

import { useState } from 'react'
import { Employee, Organization } from '../types/organization'

interface EmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  organization: Organization
  onUpdateEmployee: (updatedEmployee: Employee) => void
}

export function EmployeeModal({ employee, isOpen, onClose, organization, onUpdateEmployee }: EmployeeModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Employee | null>(null)

  if (!isOpen || !employee) return null

  const startEditing = () => {
    setEditForm({ ...employee })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  const saveEmployee = () => {
    if (editForm) {
      onUpdateEmployee(editForm)
      setIsEditing(false)
      setEditForm(null)
    }
  }

  const handleFormChange = (field: keyof Employee, value: string) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value
      })
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">社員情報</h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={startEditing}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                編集
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {isEditing && editForm ? (
            <>
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
                    placeholder="空欄で本部直轄"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">課</label>
                  <input
                    type="text"
                    value={editForm.course || ''}
                    onChange={(e) => handleFormChange('course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="空欄で部直轄"
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
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">氏名</label>
                  <p className="text-gray-800 font-semibold">{employee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">役職</label>
                  <p className="text-gray-800">{employee.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">社員番号</label>
                  <p className="text-gray-800">{employee.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">入社日</label>
                  <p className="text-gray-800">{employee.joinDate}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">所属</label>
                <p className="text-gray-800">
                  {employee.department} / {employee.section}
                  {employee.course && ` / ${employee.course}`}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">メールアドレス</label>
                  <p className="text-gray-800 text-sm">{employee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">電話番号</label>
                  <p className="text-gray-800">{employee.phone}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">生年月日</label>
                <p className="text-gray-800">{employee.birthDate}</p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t gap-3">
          {isEditing ? (
            <>
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
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          )}
        </div>
      </div>
    </div>
  )
}