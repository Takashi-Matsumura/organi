'use client'

import { useDrop } from 'react-dnd'
import { Employee } from '../types/organization'
import { ItemTypes } from './DraggableEmployee'

interface DropZoneProps {
  onDrop: (employee: Employee, targetDepartment: string, targetSection: string, targetCourse?: string) => void
  department: string
  section: string
  course?: string
  children: React.ReactNode
  className?: string
}

export function DropZone({ 
  onDrop, 
  department, 
  section, 
  course, 
  children, 
  className = '' 
}: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.EMPLOYEE,
    drop: (item: { employee: Employee }) => {
      const employee = item.employee

      // 同じ場所への移動は無視
      if (
        employee.department === department &&
        employee.section === section &&
        (employee.course || '') === (course || '')
      ) {
        console.log('同じ場所への移動のため無視')
        return
      }

      // 管理者の自己移動を防止
      const isManagerMove = (
        employee.department === department &&
        employee.section === section &&
        employee.course === course
      )

      if (isManagerMove) {
        console.log('管理者の自己移動は無効')
        return
      }

      console.log(`${employee.name}を${department}/${section}${course ? `/${course}` : ''}に移動開始`)
      onDrop(employee, department, section, course)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  let dropClassName = className
  if (isOver && canDrop) {
    dropClassName += ' bg-green-100 border-green-300 border-2'
  } else if (canDrop) {
    dropClassName += ' border-dashed border-gray-400 hover:border-blue-400 hover:bg-blue-50'
  } else {
    dropClassName += ' border-dashed border-gray-200'
  }

  return (
    <div ref={drop as any} className={dropClassName}>
      {children}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-green-200 bg-opacity-75 rounded flex items-center justify-center z-10">
          <div className="text-center">
            <span className="text-green-800 font-bold text-lg block">ここにドロップ</span>
            <span className="text-green-700 text-sm">
              {course
                ? `${department}/${section}/${course}に配属`
                : section
                ? `${department}/${section}直属に配属`
                : `${department}本部直轄に配属`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}