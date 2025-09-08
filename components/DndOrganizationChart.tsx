'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Accordion } from './Accordion'
import { EmployeeModal } from './EmployeeModal'
import { DraggableEmployee } from './DraggableEmployee'
import { DropZone } from './DropZone'
import { Organization, Employee } from '../types/organization'

interface DndOrganizationChartProps {
  organization: Organization
  onDataUpdate: (updatedOrganization: Organization) => void
}

export function DndOrganizationChart({ organization, onDataUpdate }: DndOrganizationChartProps) {
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
    onDataUpdate(updatedOrganization)
    setSelectedEmployee(updatedEmployee)
  }

  const handleEmployeeDrop = (
    employee: Employee, 
    targetDepartment: string, 
    targetSection: string, 
    targetCourse?: string
  ) => {
    const updatedEmployee = {
      ...employee,
      department: targetDepartment,
      section: targetSection,
      course: targetCourse || ''
    }

    const updatedOrganization = {
      ...organization,
      employees: organization.employees.map(emp =>
        emp.id === employee.id ? updatedEmployee : emp
      )
    }

    onDataUpdate(updatedOrganization)
    console.log(`${employee.name}を${targetDepartment}/${targetSection}${targetCourse ? `/${targetCourse}` : ''}に移動しました`)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-bold text-blue-800 mb-2">ドラッグ&ドロップ編集モード</h2>
          <p className="text-sm text-blue-700">
            社員をドラッグして別の部署にドロップすることで配置転換ができます。社員名をクリックすると詳細情報を表示・編集できます。
          </p>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-800">{organization.name}</h1>
        
        {organization.departments.map((department) => {
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
                <DropZone
                  onDrop={handleEmployeeDrop}
                  department={department.name}
                  section=""
                  className="mb-4 min-h-[100px] border-2 relative p-2"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-2">本部直轄</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {departmentEmployees.map((employee) => (
                      <DraggableEmployee 
                        key={employee.id}
                        employee={employee}
                        onClick={() => handleEmployeeClick(employee.id)}
                      >
                        <div className="py-2 px-3 bg-blue-50 border border-blue-200 text-center rounded">
                          <span className="text-blue-600 text-sm font-medium cursor-pointer hover:text-blue-800">
                            {employee.name}（{employee.position}）
                          </span>
                        </div>
                      </DraggableEmployee>
                    ))}
                  </div>
                </DropZone>
              )}
              
              {department.sections.map((section) => {
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
                            <DropZone
                              onDrop={handleEmployeeDrop}
                              department={department.name}
                              section={section.name}
                              course={course.name}
                              className="grid grid-cols-3 gap-2 mt-2 min-h-[80px] border-2 relative p-2"
                            >
                              {courseEmployees.map((employee) => (
                                <DraggableEmployee 
                                  key={employee.id}
                                  employee={employee}
                                  onClick={() => handleEmployeeClick(employee.id)}
                                >
                                  <div className="py-2 px-3 bg-white border border-gray-200 text-center rounded">
                                    <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-800">
                                      {employee.name}（{employee.position}）
                                    </span>
                                  </div>
                                </DraggableEmployee>
                              ))}
                            </DropZone>
                          </Accordion>
                        )
                      })
                    ) : (
                      <DropZone
                        onDrop={handleEmployeeDrop}
                        department={department.name}
                        section={section.name}
                        className="grid grid-cols-3 gap-2 mt-2 min-h-[80px] border-2 relative p-2"
                      >
                        {sectionEmployees.map((employee) => (
                          <DraggableEmployee 
                            key={employee.id}
                            employee={employee}
                            onClick={() => handleEmployeeClick(employee.id)}
                          >
                            <div className="py-2 px-3 bg-white border border-gray-200 text-center rounded">
                              <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-800">
                                {employee.name}（{employee.position}）
                              </span>
                            </div>
                          </DraggableEmployee>
                        ))}
                      </DropZone>
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
    </DndProvider>
  )
}