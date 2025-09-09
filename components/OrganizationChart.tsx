'use client'

import { useState } from 'react'
import { Accordion } from './Accordion'
import { EmployeeModal } from './EmployeeModal'
import { Organization, Employee } from '../types/organization'
import { useApiAuth } from '../hooks/useApiAuth'
import { FaFilter, FaTimes } from 'react-icons/fa'

interface OrganizationChartProps {
  organization: Organization
  onDataUpdate?: (updatedOrganization: Organization) => void
}

export function OrganizationChart({ organization, onDataUpdate }: OrganizationChartProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  
  // APIキー認証
  const { canWrite } = useApiAuth()

  const handleEmployeeClick = (employeeId: string) => {
    const employee = organization.employees.find(emp => emp.id === employeeId)
    if (employee) {
      setSelectedEmployee(employee)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    const updatedOrganization = {
      ...organization,
      employees: organization.employees.map(emp =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    }
    if (onDataUpdate) {
      onDataUpdate(updatedOrganization)
    }
    setSelectedEmployee(updatedEmployee)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDepartment('')
    setSelectedPosition('')
  }

  const hasActiveFilters = Boolean(searchTerm || selectedDepartment || selectedPosition)

  // フィルター適用
  const filteredEmployees = organization.employees.filter(emp => {
    if (searchTerm && !emp.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedDepartment && emp.department !== selectedDepartment) {
      return false
    }
    if (selectedPosition && emp.position !== selectedPosition) {
      return false
    }
    return true
  })

  // フィルターされた社員のIDセット
  const filteredEmployeeIds = new Set(filteredEmployees.map(emp => emp.id))

  // 利用可能な役職を取得
  const availablePositions = Array.from(new Set(organization.employees.map(emp => emp.position))).sort()

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* フィルターセクション */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        {hasActiveFilters && (
          <div className="flex justify-end mb-4">
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <FaTimes className="mr-1" size={12} />
              クリア
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 名前検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">名前検索</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="社員名を入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {/* 部門フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">部門</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">すべて</option>
              {organization.departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 役職フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">すべて</option>
              {availablePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="mt-4 text-sm text-gray-600">
            {filteredEmployees.length}名の社員が条件に一致
          </div>
        )}
      </div>
      
      {organization.departments.map((department) => {
        // 本部長直下の社員を取得（部門長預かり）
        const departmentEmployees = organization.employees.filter(emp => 
          emp.department === department.name && 
          emp.section === '' &&
          emp.id !== department.managerId &&
          (!hasActiveFilters || filteredEmployeeIds.has(emp.id))
        )
        
        // 部門内にフィルター条件に一致する社員がいるかチェック
        const hasDepartmentMatch = !hasActiveFilters || 
          filteredEmployeeIds.has(department.managerId) ||
          organization.employees.some(emp => 
            emp.department === department.name && 
            filteredEmployeeIds.has(emp.id)
          )
        
        if (hasActiveFilters && !hasDepartmentMatch) {
          return null
        }
        
        return (
          <Accordion 
            key={department.id} 
            title={`${department.name}（${department.manager}）`}
            level={0}
            onManagerClick={() => handleEmployeeClick(department.managerId)}
            managerId={department.managerId}
            forceOpen={hasActiveFilters}
          >
            {/* 本部長直下の社員がいる場合は表示 */}
            {departmentEmployees.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-2">本部直轄</h4>
                <div className="grid grid-cols-3 gap-2">
                  {departmentEmployees.map((employee) => (
                    <div key={employee.id} className="py-2 px-3 bg-blue-50 border border-blue-200 text-center">
                      <button
                        onClick={() => handleEmployeeClick(employee.id)}
                        className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                      >
                        {employee.name}（{employee.position}）
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {department.sections.map((section) => {
            // 部直下の社員を取得（課がない場合）
            const sectionEmployees = organization.employees.filter(emp => 
              emp.department === department.name && 
              emp.section === section.name && 
              !emp.course &&
              emp.id !== section.managerId &&
              (!hasActiveFilters || filteredEmployeeIds.has(emp.id))
            )
            
            // 部内にフィルター条件に一致する社員がいるかチェック
            const hasSectionMatch = !hasActiveFilters || 
              filteredEmployeeIds.has(section.managerId) ||
              organization.employees.some(emp => 
                emp.department === department.name && 
                emp.section === section.name && 
                filteredEmployeeIds.has(emp.id)
              )
            
            if (hasActiveFilters && !hasSectionMatch) {
              return null
            }
            
            return (
              <Accordion 
                key={section.id} 
                title={`${section.name}（${section.manager}）`}
                level={1}
                onManagerClick={() => handleEmployeeClick(section.managerId)}
                managerId={section.managerId}
                forceOpen={hasActiveFilters}
              >
                {section.courses.length > 0 ? (
                  // 課がある場合の表示
                  section.courses.map((course) => {
                    const courseEmployees = organization.employees.filter(emp => 
                      emp.department === department.name && 
                      emp.section === section.name && 
                      emp.course === course.name &&
                      emp.id !== course.managerId &&
                      (!hasActiveFilters || filteredEmployeeIds.has(emp.id))
                    )
                    
                    // 課内にフィルター条件に一致する社員がいるかチェック
                    const hasCourseMatch = !hasActiveFilters || 
                      filteredEmployeeIds.has(course.managerId) ||
                      organization.employees.some(emp => 
                        emp.department === department.name && 
                        emp.section === section.name && 
                        emp.course === course.name &&
                        filteredEmployeeIds.has(emp.id)
                      )
                    
                    if (hasActiveFilters && !hasCourseMatch) {
                      return null
                    }
                    
                    return (
                      <Accordion
                        key={course.id}
                        title={`${course.name}（${course.manager}）`}
                        level={2}
                        onManagerClick={() => handleEmployeeClick(course.managerId)}
                        managerId={course.managerId}
                        forceOpen={hasActiveFilters}
                      >
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {courseEmployees.map((employee) => (
                            <div key={employee.id} className="py-2 px-3 bg-white border border-gray-200 text-center">
                              <button
                                onClick={() => handleEmployeeClick(employee.id)}
                                className="text-blue-600 hover:text-blue-800 underline text-sm"
                              >
                                {employee.name}（{employee.position}）
                              </button>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    )
                  })
                ) : (
                  // 課がない場合は部直下に社員を表示
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {sectionEmployees.map((employee) => (
                      <div key={employee.id} className="py-2 px-3 bg-white border border-gray-200 text-center">
                        <button
                          onClick={() => handleEmployeeClick(employee.id)}
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {employee.name}（{employee.position}）
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Accordion>
            )
          })}
          </Accordion>
        )
      })}
      
      <EmployeeModal 
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={closeModal}
        organization={organization}
        onUpdateEmployee={handleEmployeeUpdate}
        onUpdateOrganization={onDataUpdate}
      />
    </div>
  )
}