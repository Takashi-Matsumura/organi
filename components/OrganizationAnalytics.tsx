'use client'

import { useMemo } from 'react'
import { Organization, QualificationGrade } from '../types/organization'

interface OrganizationAnalyticsProps {
  organization: Organization
}

export function OrganizationAnalytics({ organization }: OrganizationAnalyticsProps) {
  // 資格等級の分布を計算
  const qualificationStats = useMemo(() => {
    const grades: QualificationGrade[] = ['SA', 'S4', 'S3', 'S2', 'S1', 'C3', 'C2', 'C1', 'E3', 'E2', 'E1']
    const stats = grades.map(grade => ({
      grade,
      count: organization.employees.filter(emp => emp.qualificationGrade === grade).length
    }))
    const unsetCount = organization.employees.filter(emp => !emp.qualificationGrade).length
    if (unsetCount > 0) {
      stats.push({ grade: '未設定' as QualificationGrade, count: unsetCount })
    }
    return stats
  }, [organization.employees])

  // 部門別人数を計算
  const departmentStats = useMemo(() => {
    return organization.departments.map(dept => ({
      name: dept.name,
      count: organization.employees.filter(emp => emp.department === dept.name).length
    }))
  }, [organization])

  // 年齢分布を計算
  const ageStats = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const ageGroups = {
      '20代': 0,
      '30代': 0,
      '40代': 0,
      '50代': 0,
      '60代以上': 0
    }

    organization.employees.forEach(emp => {
      const birthYear = new Date(emp.birthDate).getFullYear()
      const age = currentYear - birthYear

      if (age < 30) ageGroups['20代']++
      else if (age < 40) ageGroups['30代']++
      else if (age < 50) ageGroups['40代']++
      else if (age < 60) ageGroups['50代']++
      else ageGroups['60代以上']++
    })

    return Object.entries(ageGroups).map(([group, count]) => ({ group, count }))
  }, [organization.employees])

  // 入社年度別分析
  const joinYearStats = useMemo(() => {
    const yearCounts: { [key: string]: number } = {}

    organization.employees.forEach(emp => {
      const year = emp.joinDate.substring(0, 4)
      yearCounts[year] = (yearCounts[year] || 0) + 1
    })

    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year))
  }, [organization.employees])

  // 役職別分析
  const positionStats = useMemo(() => {
    const positionCounts: { [key: string]: number } = {}

    organization.employees.forEach(emp => {
      positionCounts[emp.position] = (positionCounts[emp.position] || 0) + 1
    })

    return Object.entries(positionCounts)
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count)
  }, [organization.employees])

  // プログレスバーコンポーネント
  const ProgressBar = ({ value, max, color = "bg-blue-500" }: { value: number; max: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color} transition-all duration-300`}
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
  )

  const maxCount = Math.max(...departmentStats.map(d => d.count))
  const maxQualCount = Math.max(...qualificationStats.map(q => q.count))
  const maxAgeCount = Math.max(...ageStats.map(a => a.count))

  return (
    <div className="space-y-8">
      {/* 概要統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{organization.employees.length}</div>
          <div className="text-gray-600">総社員数</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{organization.departments.length}</div>
          <div className="text-gray-600">本部数</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {organization.departments.reduce((acc, dept) => acc + dept.sections.length, 0)}
          </div>
          <div className="text-gray-600">部数</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {organization.departments.reduce((acc, dept) =>
              acc + dept.sections.reduce((sAcc, sect) => sAcc + sect.courses.length, 0), 0
            )}
          </div>
          <div className="text-gray-600">課数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 資格等級分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">資格等級分布</h3>
          <div className="space-y-3">
            {qualificationStats
              .filter(stat => stat.count > 0)
              .map((stat) => (
              <div key={stat.grade} className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-20">
                  <span className="font-medium text-sm">{stat.grade}</span>
                </div>
                <div className="flex-1 mx-4">
                  <ProgressBar
                    value={stat.count}
                    max={maxQualCount}
                    color={
                      stat.grade.startsWith('S') ? 'bg-red-500' :
                      stat.grade.startsWith('C') ? 'bg-yellow-500' :
                      stat.grade.startsWith('E') ? 'bg-green-500' : 'bg-gray-400'
                    }
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 部門別人数 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">部門別人数</h3>
          <div className="space-y-3">
            {departmentStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-32">
                  <span className="font-medium text-sm truncate">{stat.name}</span>
                </div>
                <div className="flex-1 mx-4">
                  <ProgressBar value={stat.count} max={maxCount} color="bg-blue-500" />
                </div>
                <div className="w-8 text-right text-sm font-medium">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 年齢分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">年齢分布</h3>
          <div className="space-y-3">
            {ageStats
              .filter(stat => stat.count > 0)
              .map((stat) => (
              <div key={stat.group} className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-20">
                  <span className="font-medium text-sm">{stat.group}</span>
                </div>
                <div className="flex-1 mx-4">
                  <ProgressBar value={stat.count} max={maxAgeCount} color="bg-purple-500" />
                </div>
                <div className="w-8 text-right text-sm font-medium">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 入社年度 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">入社年度別人数</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {joinYearStats.map((stat) => (
              <div key={stat.year} className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-16">
                  <span className="font-medium text-sm">{stat.year}</span>
                </div>
                <div className="flex-1 mx-4">
                  <ProgressBar
                    value={stat.count}
                    max={Math.max(...joinYearStats.map(s => s.count))}
                    color="bg-green-500"
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 役職別分析（大きなテーブル） */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">役職別人数</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positionStats.map((stat) => (
            <div key={stat.position} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium text-sm truncate flex-1">{stat.position}</span>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                {stat.count}名
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 詳細データテーブル */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">社員一覧（簡易表示）</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">氏名</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">役職</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">本部</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">部</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">課</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">資格等級</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">入社年</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {organization.employees.slice(0, 20).map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{employee.name}</td>
                  <td className="px-4 py-2 text-sm">{employee.position}</td>
                  <td className="px-4 py-2 text-sm">{employee.department}</td>
                  <td className="px-4 py-2 text-sm">{employee.section || '-'}</td>
                  <td className="px-4 py-2 text-sm">{employee.course || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      employee.qualificationGrade?.startsWith('S') ? 'bg-red-100 text-red-800' :
                      employee.qualificationGrade?.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      employee.qualificationGrade?.startsWith('E') ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.qualificationGrade || '未設定'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{employee.joinDate.substring(0, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {organization.employees.length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              他{organization.employees.length - 20}名の社員データがあります
            </div>
          )}
        </div>
      </div>
    </div>
  )
}