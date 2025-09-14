'use client'

import { useState, useMemo } from 'react'
import { Organization, Employee, QualificationGrade } from '../types/organization'
import { EmployeeModal } from './EmployeeModal'
import { FaSearch, FaFilter, FaTimes, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa'

interface EmployeeSearchProps {
  organization: Organization
  onUpdateEmployee: (employee: Employee) => void
  onUpdateOrganization: (organization: Organization) => void
}

type SortField = 'name' | 'position' | 'department' | 'joinDate' | 'qualificationGrade'
type SortDirection = 'asc' | 'desc' | null

interface SearchFilters {
  searchText: string
  department: string
  section: string
  course: string
  position: string
  qualificationGrade: string
  joinYearFrom: string
  joinYearTo: string
}

export function EmployeeSearch({ organization, onUpdateEmployee, onUpdateOrganization }: EmployeeSearchProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
    department: '',
    section: '',
    course: '',
    position: '',
    qualificationGrade: '',
    joinYearFrom: '',
    joinYearTo: ''
  })

  // 部門、部、課、役職の選択肢を取得
  const filterOptions = useMemo(() => {
    const departments = [...new Set(organization.employees.map(emp => emp.department))]
    const sections = [...new Set(organization.employees.map(emp => emp.section).filter(s => s))]
    const courses = [...new Set(organization.employees.map(emp => emp.course).filter(c => c))]
    const positions = [...new Set(organization.employees.map(emp => emp.position))]
    const qualificationGrades: QualificationGrade[] = ['SA', 'S4', 'S3', 'S2', 'S1', 'C3', 'C2', 'C1', 'E3', 'E2', 'E1']

    return { departments, sections, courses, positions, qualificationGrades }
  }, [organization])

  // フィルタリングされた社員リスト
  const filteredEmployees = useMemo(() => {
    let filtered = organization.employees

    // テキスト検索
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      )
    }

    // 部門フィルタ
    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department)
    }

    // 部フィルタ
    if (filters.section) {
      filtered = filtered.filter(emp => emp.section === filters.section)
    }

    // 課フィルタ
    if (filters.course) {
      filtered = filtered.filter(emp => emp.course === filters.course)
    }

    // 役職フィルタ
    if (filters.position) {
      filtered = filtered.filter(emp => emp.position === filters.position)
    }

    // 資格等級フィルタ
    if (filters.qualificationGrade) {
      filtered = filtered.filter(emp => emp.qualificationGrade === filters.qualificationGrade)
    }

    // 入社年度フィルタ
    if (filters.joinYearFrom || filters.joinYearTo) {
      filtered = filtered.filter(emp => {
        const joinYear = parseInt(emp.joinDate.substring(0, 4))
        const fromYear = filters.joinYearFrom ? parseInt(filters.joinYearFrom) : 0
        const toYear = filters.joinYearTo ? parseInt(filters.joinYearTo) : 9999
        return joinYear >= fromYear && joinYear <= toYear
      })
    }

    return filtered
  }, [organization.employees, filters])

  // ソートされた社員リスト
  const sortedEmployees = useMemo(() => {
    if (!sortDirection) return filteredEmployees

    return [...filteredEmployees].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'position':
          aValue = a.position
          bValue = b.position
          break
        case 'department':
          aValue = `${a.department} ${a.section} ${a.course || ''}`
          bValue = `${b.department} ${b.section} ${b.course || ''}`
          break
        case 'joinDate':
          aValue = a.joinDate
          bValue = b.joinDate
          break
        case 'qualificationGrade':
          const gradeOrder = ['SA', 'S4', 'S3', 'S2', 'S1', 'C3', 'C2', 'C1', 'E3', 'E2', 'E1']
          aValue = gradeOrder.indexOf(a.qualificationGrade || 'E1')
          bValue = gradeOrder.indexOf(b.qualificationGrade || 'E1')
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, 'ja')
          : bValue.localeCompare(aValue, 'ja')
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [filteredEmployees, sortField, sortDirection])

  // ページネーション
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage)

  // ソートハンドラ
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField('name')
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // フィルタ変更ハンドラ
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // フィルタクリア
  const clearFilters = () => {
    setFilters({
      searchText: '',
      department: '',
      section: '',
      course: '',
      position: '',
      qualificationGrade: '',
      joinYearFrom: '',
      joinYearTo: ''
    })
    setCurrentPage(1)
  }

  // 社員詳細表示
  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  // ソートアイコン
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 text-gray-400" />
    if (sortDirection === 'asc') return <FaSortUp className="w-3 h-3 text-blue-600" />
    if (sortDirection === 'desc') return <FaSortDown className="w-3 h-3 text-blue-600" />
    return <FaSort className="w-3 h-3 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* 検索・フィルタエリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">社員検索</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaFilter className="w-4 h-4" />
            詳細フィルタ
          </button>
        </div>

        {/* 基本検索 */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="名前、社員ID、メールアドレスで検索..."
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 詳細フィルタ */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">本部</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                {filterOptions.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部</label>
              <select
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                {filterOptions.sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">課</label>
              <select
                value={filters.course}
                onChange={(e) => handleFilterChange('course', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                {filterOptions.courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                {filterOptions.positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">資格等級</label>
              <select
                value={filters.qualificationGrade}
                onChange={(e) => handleFilterChange('qualificationGrade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                {filterOptions.qualificationGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入社年（開始）</label>
              <input
                type="number"
                placeholder="2020"
                value={filters.joinYearFrom}
                onChange={(e) => handleFilterChange('joinYearFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入社年（終了）</label>
              <input
                type="number"
                placeholder="2024"
                value={filters.joinYearTo}
                onChange={(e) => handleFilterChange('joinYearTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1900"
                max="2030"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                クリア
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">
              検索結果: {sortedEmployees.length}名
            </h3>
            <div className="text-sm text-gray-600">
              {totalPages > 1 && (
                <>ページ {currentPage} / {totalPages}</>
              )}
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    氏名
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center gap-1">
                    役職
                    {getSortIcon('position')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center gap-1">
                    所属
                    {getSortIcon('department')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('qualificationGrade')}
                >
                  <div className="flex items-center gap-1">
                    資格等級
                    {getSortIcon('qualificationGrade')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('joinDate')}
                >
                  <div className="flex items-center gap-1">
                    入社日
                    {getSortIcon('joinDate')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  連絡先
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{employee.department}</div>
                    <div className="text-gray-500">
                      {employee.section && `${employee.section}`}
                      {employee.course && ` / ${employee.course}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.qualificationGrade?.startsWith('S') ? 'bg-red-100 text-red-800' :
                      employee.qualificationGrade?.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      employee.qualificationGrade?.startsWith('E') ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.qualificationGrade || '未設定'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{employee.email}</div>
                    <div>{employee.phone}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  前へ
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2)
                    const pageNum = startPage + i
                    if (pageNum > totalPages) return null

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  次へ
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {startIndex + 1}〜{Math.min(startIndex + itemsPerPage, sortedEmployees.length)} / {sortedEmployees.length}名
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 社員詳細モーダル */}
      <EmployeeModal
        employee={selectedEmployee}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedEmployee(null)
        }}
        organization={organization}
        onUpdateEmployee={onUpdateEmployee}
        onUpdateOrganization={onUpdateOrganization}
      />
    </div>
  )
}