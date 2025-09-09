'use client'

import { useState, useEffect, useRef } from 'react'
import { Employee, Organization } from '../types/organization'
import { useApiAuth } from '../hooks/useApiAuth'

interface EmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  organization: Organization
  onUpdateEmployee: (updatedEmployee: Employee) => void
  onUpdateOrganization?: (updatedOrganization: Organization) => void
}

export function EmployeeModal({ employee, isOpen, onClose, organization, onUpdateEmployee, onUpdateOrganization }: EmployeeModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Employee | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'evaluees'>('info')
  const [isEditingEvaluees, setIsEditingEvaluees] = useState(false)
  
  // ドラッグ機能の状態
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)
  
  // APIキー認証
  const { canWrite } = useApiAuth()

  // モーダルが開かれるたびに基本情報タブにリセット
  useEffect(() => {
    if (isOpen && employee) {
      setActiveTab('info')
      setIsEditing(false)
      setIsEditingEvaluees(false)
      setEditForm(null)
      // モーダル位置をリセット
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, employee])

  // ドラッグイベントハンドラー
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        
        // 画面境界での制限を設定
        const maxX = window.innerWidth / 2 - 100
        const maxY = window.innerHeight / 2 - 100
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  if (!isOpen || !employee) return null

  // 管理職かどうかを判定
  const isManager = () => {
    return organization.departments.some(dept => dept.managerId === employee.id) ||
           organization.departments.some(dept => 
             dept.sections.some(section => section.managerId === employee.id)
           ) ||
           organization.departments.some(dept => 
             dept.sections.some(section => 
               section.courses.some(course => course.managerId === employee.id)
             )
           )
  }

  // 1次評価対象者を取得（カスタム評価関係を考慮）
  const getDirectEvaluees = (): Employee[] => {
    const evaluees: Employee[] = []
    
    // 全社員を対象に、この管理職（employee）が評価者となる社員を特定
    organization.employees.forEach(emp => {
      if (emp.id === employee.id) return // 自分自身は除外
      
      // その社員の実際の評価者を特定
      let actualEvaluatorId: string | null = null
      
      // 1. カスタム評価者が設定されている場合はそれを優先
      if (emp.evaluatorId) {
        actualEvaluatorId = emp.evaluatorId
      } else {
        // 2. デフォルトの組織階層から評価者を決定
        if (emp.section === '') {
          // 本部直轄の場合は本部長が評価者
          const dept = organization.departments.find(d => d.name === emp.department)
          if (dept) {
            actualEvaluatorId = dept.managerId
          }
        } else if (!emp.course) {
          // 部所属の場合
          organization.departments.forEach(dept => {
            const section = dept.sections.find(s => s.name === emp.section)
            if (section) {
              // 部長自身の場合は本部長が評価者
              if (emp.id === section.managerId) {
                actualEvaluatorId = dept.managerId
              } else {
                // 部の一般社員の場合は部長が評価者
                actualEvaluatorId = section.managerId
              }
            }
          })
        } else {
          // 課所属の場合
          organization.departments.forEach(dept => {
            dept.sections.forEach(section => {
              const course = section.courses.find(c => c.name === emp.course)
              if (course) {
                // 課長自身の場合は部長が評価者
                if (emp.id === course.managerId) {
                  actualEvaluatorId = section.managerId
                } else {
                  // 課の一般社員の場合は課長が評価者
                  actualEvaluatorId = course.managerId
                }
              }
            })
          })
        }
      }
      
      // この管理職が評価者の場合は被評価者リストに追加
      if (actualEvaluatorId === employee.id) {
        evaluees.push(emp)
      }
    })
    
    return evaluees
  }

  // 同じ部門内の管理職を取得（評価者候補）
  const getDepartmentManagers = (): Employee[] => {
    const managers: Employee[] = []
    const targetDepartment = organization.departments.find(dept => dept.name === employee.department)
    
    if (targetDepartment) {
      // 本部長
      const deptManager = organization.employees.find(emp => emp.id === targetDepartment.managerId)
      if (deptManager && deptManager.id !== employee.id) {
        managers.push(deptManager)
      }
      
      // 部長たち
      targetDepartment.sections.forEach(section => {
        const sectionManager = organization.employees.find(emp => emp.id === section.managerId)
        if (sectionManager && sectionManager.id !== employee.id) {
          managers.push(sectionManager)
        }
        
        // 課長たち
        section.courses.forEach(course => {
          const courseManager = organization.employees.find(emp => emp.id === course.managerId)
          if (courseManager && courseManager.id !== employee.id) {
            managers.push(courseManager)
          }
        })
      })
    }
    
    return managers
  }

  const startEditing = () => {
    setEditForm({ ...employee })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm(null)
    setActiveTab('info')
  }

  const saveEmployee = () => {
    if (editForm) {
      onUpdateEmployee(editForm)
      setIsEditing(false)
      setEditForm(null)
      setActiveTab('info')
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

  // 被評価者の評価者を変更
  const handleEvaluatorChange = (evalueeId: string, newEvaluatorId: string | null) => {
    const updatedEmployee = organization.employees.find(emp => emp.id === evalueeId)
    if (updatedEmployee) {
      const modified = {
        ...updatedEmployee,
        evaluatorId: newEvaluatorId || undefined
      }
      
      // 組織全体の従業員データを更新
      const updatedOrganization = {
        ...organization,
        employees: organization.employees.map(emp => 
          emp.id === evalueeId ? modified : emp
        )
      }
      
      // 組織データ全体を更新
      if (onUpdateOrganization) {
        onUpdateOrganization(updatedOrganization)
      } else {
        onUpdateEmployee(modified)
      }
    }
  }

  // 被評価者編集の開始/終了
  const startEditingEvaluees = () => setIsEditingEvaluees(true)
  const cancelEditingEvaluees = () => setIsEditingEvaluees(false)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        <div 
          className="flex justify-between items-center p-6 border-b cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-xl font-bold text-gray-800 pointer-events-none">社員情報</h2>
          <div className="flex items-center gap-2">
            {activeTab === 'info' && !isEditing && canWrite() && (
              <button
                onClick={startEditing}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                編集
              </button>
            )}
            {activeTab === 'evaluees' && !isEditingEvaluees && canWrite() && (
              <button
                onClick={startEditingEvaluees}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                被評価者編集
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
        
        {/* タブナビゲーション */}
        <div className="flex border-b">
          <button
            onClick={() => !isEditing && !isEditingEvaluees && setActiveTab('info')}
            className={`px-6 py-3 font-medium ${activeTab === 'info' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:text-gray-800'
            } ${(isEditing || isEditingEvaluees) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            基本情報
          </button>
          {isManager() && (
            <button
              onClick={() => !isEditing && !isEditingEvaluees && setActiveTab('evaluees')}
              className={`px-6 py-3 font-medium ${activeTab === 'evaluees' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-800'
              } ${(isEditing || isEditingEvaluees) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              被評価者（{getDirectEvaluees().length}名）
            </button>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          {activeTab === 'info' ? (
            isEditing && editForm ? (
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
            )
          ) : (
            // 被評価者タブ
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">1次評価対象者</h3>
                <span className="text-sm text-gray-500">合計 {getDirectEvaluees().length}名</span>
              </div>
              
              {getDirectEvaluees().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>1次評価対象者はいません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getDirectEvaluees().map((evaluee) => (
                    <div key={evaluee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-800">{evaluee.name}</h4>
                          <span className="text-sm text-gray-600">（{evaluee.position}）</span>
                          {evaluee.evaluatorId && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              カスタム評価
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {evaluee.department} / {evaluee.section || '本部直轄'}
                          {evaluee.course && ` / ${evaluee.course}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {isEditingEvaluees ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={evaluee.evaluatorId || employee.id}
                              onChange={(e) => handleEvaluatorChange(evaluee.id, e.target.value === employee.id ? null : e.target.value)}
                              className="text-xs px-2 py-1 border rounded"
                            >
                              <option value={employee.id}>
                                {employee.name}（現在の評価者）- {employee.section || '本部直轄'}
                              </option>
                              {getDepartmentManagers()
                                .filter(manager => manager.id !== employee.id)
                                .map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                  {manager.name}（{manager.position}）- {manager.section || '本部直轄'}{manager.course ? ` / ${manager.course}` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span>ID: {evaluee.employeeId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isEditingEvaluees && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-yellow-800 mb-2">編集中</h4>
                  <p className="text-sm text-yellow-700">
                    被評価者の評価者を変更できます。同じ部門内の管理職のみが評価者として選択可能です。
                  </p>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-800 mb-2">評価対象の説明</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• デフォルト：組織階層に基づく評価関係</li>
                  <li>• カスタム：個別に設定された評価関係</li>
                  <li>• 評価者変更は同じ部門内の管理職に限定されます</li>
                </ul>
              </div>
            </div>
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
          ) : isEditingEvaluees ? (
            <>
              <button
                onClick={cancelEditingEvaluees}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={cancelEditingEvaluees}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                完了
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