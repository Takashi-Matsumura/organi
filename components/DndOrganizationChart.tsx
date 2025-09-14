'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Accordion } from './Accordion'
import { EmployeeModal } from './EmployeeModal'
import { DraggableEmployee } from './DraggableEmployee'
import { DropZone } from './DropZone'
import { Organization, Employee } from '../types/organization'
import { useTokenAuth } from '../hooks/useTokenAuth'

interface DndOrganizationChartProps {
  organization: Organization
  onDataUpdate: (updatedOrganization: Organization) => void
}

export function DndOrganizationChart({ organization, onDataUpdate }: DndOrganizationChartProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // アクセスToken認証
  const { canWrite, canDelete } = useTokenAuth()

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
    console.log('=== 社員移動開始 ===')
    console.log('移動する社員:', employee.name, `(${employee.position})`)
    console.log('移動元:', `${employee.department}/${employee.section}${employee.course ? `/${employee.course}` : ''}`)
    console.log('移動先:', `${targetDepartment}/${targetSection}${targetCourse ? `/${targetCourse}` : ''}`)
    console.log('組織構造:', organization.departments.map(d => ({
      name: d.name,
      sections: d.sections.map(s => ({ name: s.name, manager: s.manager }))
    })))
    // 移動先の管理者を特定
    let newEvaluatorId = ''
    let newEvaluatorName = ''

    if (targetCourse) {
      // コース配属の場合、コース長が評価者
      const dept = organization.departments.find(d => d.name === targetDepartment)
      const section = dept?.sections.find(s => s.name === targetSection)
      const course = section?.courses.find(c => c.name === targetCourse)
      newEvaluatorId = course?.managerId || ''
      newEvaluatorName = course?.manager || ''
    } else if (targetSection) {
      // 部直属の場合、部長が評価者
      const dept = organization.departments.find(d => d.name === targetDepartment)
      const section = dept?.sections.find(s => s.name === targetSection)
      newEvaluatorId = section?.managerId || ''
      newEvaluatorName = section?.manager || ''
    } else {
      // 本部直属の場合、本部長が評価者
      const dept = organization.departments.find(d => d.name === targetDepartment)
      newEvaluatorId = dept?.managerId || ''
      newEvaluatorName = dept?.manager || ''
    }

    const updatedEmployee = {
      ...employee,
      department: targetDepartment,
      section: targetSection,
      course: targetCourse || '',
      evaluatorId: newEvaluatorId,
      evaluator: newEvaluatorName
    }

    const updatedOrganization = {
      ...organization,
      employees: organization.employees.map(emp =>
        emp.id === employee.id ? updatedEmployee : emp
      )
    }

    onDataUpdate(updatedOrganization)

    // 移動先の詳細な情報をログ出力
    const moveDetails = targetCourse
      ? `${targetDepartment}/${targetSection}/${targetCourse}（評価者: ${newEvaluatorName}）`
      : targetSection
      ? `${targetDepartment}/${targetSection}（評価者: ${newEvaluatorName}）`
      : `${targetDepartment}本部直轄（評価者: ${newEvaluatorName}）`

    console.log(`${employee.name}を${moveDetails}に移動しました`)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full">
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
              {/* 本部直轄のDropZone（常に表示） */}
              <DropZone
                onDrop={handleEmployeeDrop}
                department={department.name}
                section=""
                className="mb-4 min-h-[100px] border-2 relative p-2"
              >
                <div className="col-span-full">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 pl-2">{department.name}直轄</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {departmentEmployees.map((employee) => (
                    <DraggableEmployee
                      key={employee.id}
                      employee={employee}
                      onClick={() => handleEmployeeClick(employee.id)}
                    >
                      <div className="py-2 px-3 bg-blue-50 border border-blue-200 text-center rounded transform transition-all duration-200 hover:scale-[1.02] hover:shadow-sm hover:bg-blue-100">
                        <span className="text-blue-600 text-sm font-medium cursor-pointer hover:text-blue-800 transition-all duration-200 hover:text-base">
                          {employee.name}（{employee.position}）
                        </span>
                      </div>
                    </DraggableEmployee>
                  ))}
                  {departmentEmployees.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-4 text-sm">
                      ここに社員をドロップして{department.name}長直属に配属
                    </div>
                  )}
                </div>
              </DropZone>
              
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
                    {/* 部直属の社員がいる場合、または空の場合でもDropZoneを表示 */}
                    <DropZone
                      onDrop={handleEmployeeDrop}
                      department={department.name}
                      section={section.name}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-2 min-h-[80px] border-2 relative p-2 mb-4"
                    >
                      <div className="col-span-full">
                        <h5 className="text-xs font-semibold text-gray-600 mb-2">{section.name}直属</h5>
                      </div>
                      {sectionEmployees.map((employee) => (
                        <DraggableEmployee
                          key={employee.id}
                          employee={employee}
                          onClick={() => handleEmployeeClick(employee.id)}
                        >
                          <div className="py-2 px-3 bg-white border border-gray-200 text-center rounded transform transition-all duration-200 hover:scale-[1.02] hover:shadow-sm hover:bg-gray-50">
                            <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-800 transition-all duration-200 hover:text-base">
                              {employee.name}（{employee.position}）
                            </span>
                          </div>
                        </DraggableEmployee>
                      ))}
                      {sectionEmployees.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-4 text-sm">
                          ここに社員をドロップして{section.name}直属に配属
                        </div>
                      )}
                    </DropZone>

                    {/* コースがある場合の表示 */}
                    {section.courses.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2 mt-4">{section.name}内のコース</h5>
                        {section.courses.map((course) => {
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
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-2 min-h-[80px] border-2 relative p-2"
                              >
                                {courseEmployees.map((employee) => (
                                  <DraggableEmployee
                                    key={employee.id}
                                    employee={employee}
                                    onClick={() => handleEmployeeClick(employee.id)}
                                  >
                                    <div className="py-2 px-3 bg-white border border-gray-200 text-center rounded transform transition-all duration-200 hover:scale-[1.02] hover:shadow-sm hover:bg-gray-50">
                                      <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-800 transition-all duration-200 hover:text-base">
                                        {employee.name}（{employee.position}）
                                      </span>
                                    </div>
                                  </DraggableEmployee>
                                ))}
                              </DropZone>
                            </Accordion>
                          )
                        })}
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
    </DndProvider>
  )
}