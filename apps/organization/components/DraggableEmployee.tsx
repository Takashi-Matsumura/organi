'use client'

import { useDrag } from 'react-dnd'
import { Employee } from '../types/organization'

interface DraggableEmployeeProps {
  employee: Employee
  onClick: () => void
  children: React.ReactNode
}

export const ItemTypes = {
  EMPLOYEE: 'employee'
}

export function DraggableEmployee({ employee, onClick, children }: DraggableEmployeeProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EMPLOYEE,
    item: { employee },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag as any}
      onClick={onClick}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''} transition-opacity`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {children}
    </div>
  )
}