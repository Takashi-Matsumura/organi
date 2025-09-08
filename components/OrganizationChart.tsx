'use client'

import { useState } from 'react'
import { Accordion } from './Accordion'
import { EmployeeModal } from './EmployeeModal'
import { Organization, Employee } from '../types/organization'

interface OrganizationChartProps {
  organization: Organization
  onDataUpdate?: (updatedOrganization: Organization) => void
}

export function OrganizationChart({ organization, onDataUpdate }: OrganizationChartProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{organization.name}</h1>
      
      {organization.departments.map((department) => {
        // 本部長直下の社員を取得（部門長預かり）
        const departmentEmployees = organization.employees.filter(emp => 
          emp.department === department.name && 
          emp.section === '' &&
          emp.id !== department.managerId
        )
        
        return (
          <Accordion 
            key={department.id} 
            title={`${department.name}（${department.manager}）`}
            level={0}
            onManagerClick={() => handleEmployeeClick(department.managerId)}
            managerId={department.managerId}
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
              emp.id !== section.managerId
            )
            
            return (
              <Accordion 
                key={section.id} 
                title={`${section.name}（${section.manager}）`}
                level={1}
                onManagerClick={() => handleEmployeeClick(section.managerId)}
                managerId={section.managerId}
              >
                {section.courses.length > 0 ? (
                  // 課がある場合の表示
                  section.courses.map((course) => {
                    const courseEmployees = organization.employees.filter(emp => 
                      emp.department === department.name && 
                      emp.section === section.name && 
                      emp.course === course.name &&
                      emp.id !== course.managerId
                    )
                    
                    return (
                      <Accordion
                        key={course.id}
                        title={`${course.name}（${course.manager}）`}
                        level={2}
                        onManagerClick={() => handleEmployeeClick(course.managerId)}
                        managerId={course.managerId}
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