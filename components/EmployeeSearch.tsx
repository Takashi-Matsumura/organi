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
  positions: string[] // 複数選択対応
  qualificationGrade: string
}

// 役職・職種の階層構造を定義
interface PositionCategory {
  name: string
  positions: string[]
}

const POSITION_CATEGORIES: PositionCategory[] = [
  {
    name: '管理職',
    positions: ['本部長', '副本部長', '部長', '課長', '管理職']
  },
  {
    name: 'エンジニア',
    positions: ['シニアエンジニア', 'エンジニア', 'ジュニアエンジニア', 'インフラエンジニア', 'テストエンジニア', 'QAエンジニア', 'セキュリティエンジニア', 'ペネトレーションテスター']
  },
  {
    name: '専門職',
    positions: ['法務スペシャリスト', 'コンプライアンス担当', 'QAスペシャリスト', 'セキュリティアナリスト', '技術戦略担当']
  },
  {
    name: '一般職',
    positions: ['課長', '一般社員', '主任', '本部付主任', 'アシスタント', '本部アシスタント']
  }
]

export function EmployeeSearch({ organization, onUpdateEmployee, onUpdateOrganization }: EmployeeSearchProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [editingEvaluator, setEditingEvaluator] = useState<string | null>(null)

  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
    department: '',
    section: '',
    course: '',
    positions: [],
    qualificationGrade: ''
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

  // 評価関係を計算するヘルパー関数
  const getEvaluationRelations = useMemo(() => {
    const evaluationMap = new Map<string, { evaluator: Employee | null, evalueeCount: number }>()

    // 全社員を初期化
    organization.employees.forEach(emp => {
      evaluationMap.set(emp.id, { evaluator: null, evalueeCount: 0 })
    })

    // 各社員の評価者を決定（カスタム評価者またはデフォルト組織階層）
    organization.employees.forEach(emp => {
      let evaluatorId: string | null = null
      let evaluator: Employee | null = null

      // カスタム評価者が設定されている場合
      if (emp.evaluatorId) {
        evaluatorId = emp.evaluatorId
        evaluator = organization.employees.find(e => e.id === emp.evaluatorId) || null
      } else {
        // デフォルト組織階層に基づく評価者を特定
        if (emp.section === '') {
          // 本部直轄の場合は本部長が評価者
          const dept = organization.departments.find(d => d.name === emp.department)
          if (dept && dept.managerId !== emp.id) {
            evaluatorId = dept.managerId
            evaluator = organization.employees.find(e => e.id === dept.managerId) || null
          }
        } else if (!emp.course || emp.course === '') {
          // 部直轄の場合は部長が評価者
          const dept = organization.departments.find(d => d.name === emp.department)
          const section = dept?.sections.find(s => s.name === emp.section)
          if (section && section.managerId !== emp.id) {
            evaluatorId = section.managerId
            evaluator = organization.employees.find(e => e.id === section.managerId) || null
          }
        } else {
          // 課所属の場合は課長が評価者
          const dept = organization.departments.find(d => d.name === emp.department)
          const section = dept?.sections.find(s => s.name === emp.section)
          const course = section?.courses.find(c => c.name === emp.course)
          if (course && course.managerId !== emp.id) {
            evaluatorId = course.managerId
            evaluator = organization.employees.find(e => e.id === course.managerId) || null
          }
        }
      }

      // 評価者情報を設定
      const currentData = evaluationMap.get(emp.id)
      if (currentData) {
        evaluationMap.set(emp.id, { ...currentData, evaluator })
      }

      // 評価者の被評価者数をカウント
      if (evaluatorId) {
        const evaluatorData = evaluationMap.get(evaluatorId)
        if (evaluatorData) {
          evaluationMap.set(evaluatorId, {
            ...evaluatorData,
            evalueeCount: evaluatorData.evalueeCount + 1
          })
        }
      }
    })

    return evaluationMap
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

    // 役職・職種フィルタ（複数選択対応）
    if (filters.positions.length > 0) {
      filtered = filtered.filter(emp => {
        // 選択された項目に直接一致するかチェック
        if (filters.positions.includes(emp.position)) {
          return true
        }

        // カテゴリが選択されている場合、そのカテゴリに含まれる役職かチェック
        return POSITION_CATEGORIES.some(category =>
          filters.positions.includes(category.name) &&
          category.positions.includes(emp.position)
        )
      })
    }

    // 資格等級フィルタ
    if (filters.qualificationGrade) {
      filtered = filtered.filter(emp => emp.qualificationGrade === filters.qualificationGrade)
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
  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // 役職・職種の複数選択ハンドラ
  const handlePositionToggle = (position: string) => {
    const newPositions = filters.positions.includes(position)
      ? filters.positions.filter(p => p !== position)
      : [...filters.positions, position]
    handleFilterChange('positions', newPositions)
  }

  // ページあたり表示数変更ハンドラ
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  // フィルタクリア
  const clearFilters = () => {
    setFilters({
      searchText: '',
      department: '',
      section: '',
      course: '',
      positions: [],
      qualificationGrade: ''
    })
    setCurrentPage(1)
  }

  // 社員詳細表示
  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  // 評価者変更ハンドラー
  const handleEvaluatorChange = (employeeId: string, newEvaluatorId: string) => {
    const employee = organization.employees.find(emp => emp.id === employeeId)
    const newEvaluator = organization.employees.find(emp => emp.id === newEvaluatorId)

    if (!employee) return

    const updatedEmployee = {
      ...employee,
      evaluatorId: newEvaluatorId,
      evaluator: newEvaluator?.name || ''
    }

    onUpdateEmployee(updatedEmployee)
    setEditingEvaluator(null)
  }

  // 評価担当フラグ変更ハンドラー
  const handleEvaluatorFlagChange = (employeeId: string, isEvaluator: boolean) => {
    const employee = organization.employees.find(emp => emp.id === employeeId)

    if (!employee) return

    const updatedEmployee = {
      ...employee,
      isEvaluator
    }

    onUpdateEmployee(updatedEmployee)
  }

  // 評価担当候補を取得（isEvaluatorフラグまたは管理職）
  const getEvaluatorCandidates = useMemo(() => {
    return organization.employees.filter(emp => {
      // isEvaluatorフラグが明示的に設定されている場合はそれに従う
      if (emp.isEvaluator !== undefined) {
        return emp.isEvaluator
      }
      // フラグが未設定の場合は管理職をデフォルトとする
      return emp.position.includes('本部長') ||
        emp.position.includes('副本部長') ||
        emp.position.includes('部長') ||
        emp.position.includes('課長') ||
        emp.position.includes('管理職')
    })
  }, [organization])

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
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左側：組織フィルタ */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-300 pb-1">組織フィルタ</h4>
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
              </div>

              {/* 中央：役職・職種フィルタ */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-300 pb-1">役職・職種</h4>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded p-3 bg-white">
                  {POSITION_CATEGORIES.map(category => (
                    <div key={category.name} className="mb-4">
                      {/* カテゴリヘッダー */}
                      <div className="flex items-center mb-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.positions.includes(category.name)}
                            onChange={() => handlePositionToggle(category.name)}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-800">{category.name}</span>
                        </label>
                      </div>

                      {/* 個別の役職・職種 */}
                      <div className="ml-6 space-y-1">
                        {category.positions
                          .filter(pos => filterOptions.positions.includes(pos))
                          .map(position => (
                          <label key={position} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.positions.includes(position)}
                              onChange={() => handlePositionToggle(position)}
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{position}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* その他の役職（カテゴリに含まれないもの） */}
                  {(() => {
                    const allCategoryPositions = POSITION_CATEGORIES.flatMap(cat => cat.positions)
                    const otherPositions = filterOptions.positions.filter(pos =>
                      !allCategoryPositions.includes(pos)
                    )

                    if (otherPositions.length === 0) return null

                    return (
                      <div className="mb-4">
                        <div className="font-medium text-gray-800 mb-2">その他</div>
                        <div className="ml-6 space-y-1">
                          {otherPositions.map(position => (
                            <label key={position} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.positions.includes(position)}
                                onChange={() => handlePositionToggle(position)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{position}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* 右側：その他フィルタとコントロール */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-300 pb-1">その他</h4>
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

                <div className="pt-4">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    フィルタクリア
                  </button>
                </div>
              </div>
            </div>

            {/* 選択済み項目表示（全体の下部に配置） */}
            {filters.positions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <h5 className="text-sm font-medium text-gray-700 mb-2">選択中の役職・職種:</h5>
                <div className="flex flex-wrap gap-2">
                  {filters.positions.map(position => (
                    <span
                      key={position}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {position}
                      <button
                        onClick={() => handlePositionToggle(position)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>表示件数:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20件</option>
                  <option value={50}>50件</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {totalPages > 1 && (
                  <>ページ {currentPage} / {totalPages}</>
                )}
              </div>
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
                    役職・職種
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
                  現在の評価者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  被評価者数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  評価担当
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
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {editingEvaluator === employee.id ? (
                      <select
                        value={employee.evaluatorId || ''}
                        onChange={(e) => handleEvaluatorChange(employee.id, e.target.value)}
                        onBlur={() => setEditingEvaluator(null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      >
                        <option value="">未設定</option>
                        {getEvaluatorCandidates.map(evaluator => (
                          <option key={evaluator.id} value={evaluator.id}>
                            {evaluator.name}（{evaluator.position}）- {evaluator.department}
                            {evaluator.section && ` / ${evaluator.section}`}
                            {evaluator.course && ` / ${evaluator.course}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                        onClick={() => setEditingEvaluator(employee.id)}
                      >
                        {(() => {
                          const relations = getEvaluationRelations.get(employee.id)
                          return relations?.evaluator ? (
                            <div>
                              <div className="font-medium text-blue-600">{relations.evaluator.name}</div>
                              <div className="text-xs text-gray-500">{relations.evaluator.position}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">クリックして設定</div>
                          )
                        })()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {(() => {
                      const relations = getEvaluationRelations.get(employee.id)
                      const count = relations?.evalueeCount || 0
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {count}名
                        </span>
                      )
                    })()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={employee.isEvaluator || false}
                        onChange={(e) => handleEvaluatorFlagChange(employee.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
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