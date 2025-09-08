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
      // 同じ場所への移動は無視
      if (
        item.employee.department === department &&
        item.employee.section === section &&
        item.employee.course === course
      ) {
        return
      }
      onDrop(item.employee, department, section, course)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  let dropClassName = className
  if (isOver && canDrop) {
    dropClassName += ' bg-green-100 border-green-300'
  } else if (canDrop) {
    dropClassName += ' border-dashed border-gray-300'
  }

  return (
    <div ref={drop as any} className={dropClassName}>
      {children}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-green-200 bg-opacity-50 rounded flex items-center justify-center">
          <span className="text-green-800 font-medium">ここにドロップ</span>
        </div>
      )}
    </div>
  )
}