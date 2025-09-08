'use client'

import { useState } from 'react'
import { IoChevronForward } from 'react-icons/io5'
import { FaBuilding, FaUsers, FaUserTie } from 'react-icons/fa'

interface AccordionProps {
  title: string | React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  level?: number
  onManagerClick?: () => void
  managerId?: string
  forceOpen?: boolean
}

export function Accordion({ title, children, defaultOpen = false, level = 0, onManagerClick, managerId, forceOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  // フィルター条件に応じて強制展開
  const shouldBeOpen = forceOpen || isOpen
  
  const paddingClass = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : level === 2 ? 'pl-12' : 'pl-16'
  const bgColorClass = level === 0 ? 'bg-blue-50' : level === 1 ? 'bg-green-50' : level === 2 ? 'bg-yellow-50' : 'bg-purple-50'
  const borderColorClass = level === 0 ? 'border-blue-200' : level === 1 ? 'border-green-200' : level === 2 ? 'border-yellow-200' : 'border-purple-200'

  const handleTitleClick = (e: React.MouseEvent) => {
    if (onManagerClick && managerId) {
      const target = e.target as HTMLElement
      if (target.classList.contains('manager-name')) {
        e.stopPropagation()
        onManagerClick()
        return
      }
    }
    setIsOpen(!isOpen)
  }

  const getIconForLevel = () => {
    switch (level) {
      case 0: return <FaBuilding className="text-blue-600 mr-2" size={16} />
      case 1: return <FaUsers className="text-green-600 mr-2" size={16} />
      case 2: return <FaUserTie className="text-yellow-600 mr-2" size={16} />
      default: return null
    }
  }

  const renderTitle = () => {
    if (typeof title === 'string' && onManagerClick && managerId) {
      const parts = title.match(/^(.+)（(.+)）$/)
      if (parts) {
        const [, groupName, managerName] = parts
        return (
          <div className="font-medium text-gray-800 flex items-center">
            {getIconForLevel()}
            <span>{groupName}（</span>
            <span 
              className="manager-name text-blue-600 hover:text-blue-800 underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onManagerClick()
              }}
            >
              {managerName}
            </span>
            <span>）</span>
          </div>
        )
      }
    }
    return (
      <div className="font-medium text-gray-800 flex items-center">
        {getIconForLevel()}
        {title}
      </div>
    )
  }

  return (
    <div className={`border ${borderColorClass} mb-2`}>
      <button
        className={`w-full ${paddingClass} py-3 text-left flex items-center justify-between ${bgColorClass} hover:opacity-80 transition-opacity`}
        onClick={handleTitleClick}
      >
        {renderTitle()}
        <IoChevronForward 
          className={`transform transition-transform duration-200 mr-4 text-gray-600 ${shouldBeOpen ? 'rotate-90' : ''}`}
          size={16}
        />
      </button>
      {shouldBeOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}