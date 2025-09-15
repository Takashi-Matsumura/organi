'use client'

import { useState, useEffect, useRef } from 'react'
import { OrganizationChart } from '../components/OrganizationChart'
import { DndOrganizationChart } from '../components/DndOrganizationChart'
import { OrganizationAnalytics } from '../components/OrganizationAnalytics'
import { EmployeeSearch } from '../components/EmployeeSearch'
import { AccessTokenInput } from '../components/AccessTokenInput'
import { AuthorizationTestPanel } from '../components/AuthorizationTestPanel'
import { Organization, Employee } from '../types/organization'
import { useTokenAuth } from '../hooks/useTokenAuth'
import { FaEdit, FaDownload, FaUpload, FaChevronDown, FaSignOutAlt, FaKey, FaChartBar, FaSitemap, FaSearch } from 'react-icons/fa'

const loadOrganizationData = async (): Promise<Organization> => {
  try {
    console.log('Fetching from /api/organization...')
    const response = await fetch('/api/organization')
    console.log('Response status:', response.status, response.ok)
    if (!response.ok) {
      throw new Error(`データファイルの読み込みに失敗しました: ${response.status}`)
    }
    const data = await response.json()
    console.log('Parsed JSON data:', data ? `Success with ${data.employees?.length || 0} employees` : 'No data')

    // 既存データに評価担当フラグを設定
    if (data && data.employees) {
      data.employees = data.employees.map((emp: Employee) => {
        // isEvaluatorフラグが未設定の場合のみデフォルト値を設定
        if (emp.isEvaluator === undefined) {
          const isManager = emp.position.includes('本部長') ||
            emp.position.includes('副本部長') ||
            emp.position.includes('部長') ||
            emp.position.includes('課長') ||
            emp.position.includes('管理職')

          return { ...emp, isEvaluator: isManager }
        }
        return emp
      })
    }

    return data
  } catch (error) {
    console.error('組織データの読み込みエラー:', error)
    throw error
  }
}

const saveOrganizationData = async (data: Organization): Promise<void> => {
  try {
    const response = await fetch('/api/organization', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'データの保存に失敗しました')
    }
    
    console.log('組織データが正常に保存されました')
  } catch (error) {
    console.error('組織データの保存エラー:', error)
    throw error
  }
}

export default function Home() {
  const [organizationData, setOrganizationData] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showAuthTestPanel, setShowAuthTestPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<'organization' | 'analytics' | 'search'>('organization')
  const exportMenuRef = useRef<HTMLDivElement>(null)
  
  const { isAuthenticated, canWrite, canDelete, role, logout } = useTokenAuth()
  
  // 認証状態のデバッグログ
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, role })
  }, [isAuthenticated, role])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const initializeData = async () => {
      console.log('Starting data initialization...')
      try {
        console.log('Calling loadOrganizationData...')
        const data = await loadOrganizationData()
        console.log('Data loaded successfully:', data ? `Data available with ${data.employees?.length || 0} employees` : 'No data')
        setOrganizationData(data)
        console.log('Organization data set')
      } catch (error) {
        console.error('Data loading error:', error)
        setError('組織データの読み込みに失敗しました。ページを再読み込みしてください。')
      } finally {
        console.log('Setting loading to false')
        setLoading(false)
      }
    }

    console.log('useEffect triggered - starting initialization')
    initializeData()

    // フォールバック: 5秒後に強制的にローディングを終了
    const fallbackTimeout = setTimeout(() => {
      console.log('Fallback: Setting loading to false after timeout')
      setLoading(false)
    }, 5000)

    return () => clearTimeout(fallbackTimeout)
  }, [])

  const handleDataUpdate = async (newData: Organization) => {
    try {
      setOrganizationData(newData)
      await saveOrganizationData(newData)
    } catch (error) {
      console.error('データ更新エラー:', error)
      alert('データの保存に失敗しました。再試行してください。')
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const exportData = (format: 'organization-md' | 'evaluation-md' | 'csv') => {
    if (!organizationData) return
    
    let content: string
    let fileName: string
    let mimeType: string
    
    switch (format) {
      case 'organization-md':
        content = generateOrganizationMarkdown(organizationData)
        fileName = 'organization-structure.md'
        mimeType = 'text/markdown'
        break
      case 'evaluation-md':
        content = generateEvaluationMarkdown(organizationData)
        fileName = 'evaluation-relationships.md'
        mimeType = 'text/markdown'
        break
      case 'csv':
        content = generateCSV(organizationData)
        fileName = 'organization-evaluation-data.csv'
        mimeType = 'text/csv'
        break
    }
    
    const dataBlob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 1. 組織図ベースのマークダウン生成
  const generateOrganizationMarkdown = (data: Organization): string => {
    let md = `# ${data.name}\n\n`
    
    md += '## 組織構造\n\n'
    
    data.departments.forEach((department) => {
      md += `### ${department.name}\n`
      md += `- **本部長**: ${department.manager}\n`
      
      // 本部長直下の社員
      const departmentEmployees = data.employees.filter(emp => 
        emp.department === department.name && 
        emp.section === '' &&
        emp.id !== department.managerId
      )
      
      if (departmentEmployees.length > 0) {
        md += '\n#### 本部直轄\n'
        departmentEmployees.forEach((emp) => {
          md += `- ${emp.name}${emp.position ? `（${emp.position}）` : ''}\n`
        })
        md += '\n'
      }
      
      department.sections.forEach((section) => {
        md += `\n#### ${section.name}\n`
        md += `- **部長**: ${section.manager}\n`
        
        if (section.courses.length > 0) {
          // 課がある場合
          section.courses.forEach((course) => {
            md += `\n##### ${course.name}\n`
            md += `- **課長**: ${course.manager}\n`
            
            const courseEmployees = data.employees.filter(emp => 
              emp.department === department.name && 
              emp.section === section.name && 
              emp.course === course.name &&
              emp.id !== course.managerId
            )
            
            if (courseEmployees.length > 0) {
              md += '\n**メンバー:**\n'
              courseEmployees.forEach((emp) => {
                md += `- ${emp.name}${emp.position ? `（${emp.position}）` : ''}\n`
              })
            }
            md += '\n'
          })
        } else {
          // 課がない部の場合
          const sectionEmployees = data.employees.filter(emp => 
            emp.department === department.name && 
            emp.section === section.name && 
            !emp.course &&
            emp.id !== section.managerId
          )
          
          if (sectionEmployees.length > 0) {
            md += '\n**メンバー:**\n'
            sectionEmployees.forEach((emp) => {
              md += `- ${emp.name}${emp.position ? `（${emp.position}）` : ''}\n`
            })
          }
          md += '\n'
        }
      })
      
      md += '\n'
    })
    
    // 社員一覧
    md += '## 社員一覧\n\n'
    md += '| 社員ID | 名前 | 部署 | 部 | 課 | 役職・職種 | メール | 電話番号 | 入社日 | 生年月日 |\n'
    md += '|--------|------|------|-----|-----|------|-------|---------|----------|-----------|\n'
    
    data.employees.forEach((emp) => {
      md += `| ${emp.employeeId} | ${emp.name} | ${emp.department} | ${emp.section || '-'} | ${emp.course || '-'} | ${emp.position} | ${emp.email} | ${emp.phone} | ${emp.joinDate} | ${emp.birthDate} |\n`
    })
    
    md += '\n\n'
    md += '---\n'
    md += `*エクスポート日時: ${new Date().toLocaleString('ja-JP')}*\n`
    
    return md
  }

  // 2. 評価関係ベースのマークダウン生成
  const generateEvaluationMarkdown = (data: Organization): string => {
    let md = `# ${data.name} - 人事評価関係\n\n`
    
    // 評価者ごとのグループ化
    const evaluatorMap = new Map<string, Employee[]>()
    
    data.employees.forEach(emp => {
      // 評価者を特定
      let evaluatorId: string | null = emp.evaluatorId || null
      
      // カスタム評価者がない場合は、デフォルトの組織階層から判定
      if (!evaluatorId) {
        // 本部直轄の場合は本部長が評価者
        if (emp.section === '') {
          const dept = data.departments.find(d => d.name === emp.department)
          if (dept && dept.managerId !== emp.id) {
            evaluatorId = dept.managerId
          }
        }
        // 部直轄の場合は部長が評価者
        else if (!emp.course) {
          data.departments.forEach(dept => {
            const section = dept.sections.find(s => s.name === emp.section)
            if (section && section.managerId !== emp.id) {
              evaluatorId = section.managerId
            }
          })
        }
        // 課所属の場合は課長が評価者
        else {
          data.departments.forEach(dept => {
            dept.sections.forEach(section => {
              const course = section.courses.find(c => c.name === emp.course)
              if (course && course.managerId !== emp.id) {
                evaluatorId = course.managerId
              }
            })
          })
        }
      }
      
      if (evaluatorId) {
        if (!evaluatorMap.has(evaluatorId)) {
          evaluatorMap.set(evaluatorId, [])
        }
        evaluatorMap.get(evaluatorId)!.push(emp)
      }
    })
    
    md += '## 評価者別の被評価者一覧\n\n'
    
    // 評価者ごとに出力
    evaluatorMap.forEach((evaluees, evaluatorId) => {
      const evaluator = data.employees.find(emp => emp.id === evaluatorId)
      if (evaluator) {
        md += `### ${evaluator.name}（${evaluator.position}）\n`
        md += `**所属**: ${evaluator.department} / ${evaluator.section || '本部直轄'}`
        if (evaluator.course) md += ` / ${evaluator.course}`
        md += '\n\n'
        
        md += '**被評価者:**\n'
        evaluees.forEach(evaluee => {
          const isCustom = evaluee.evaluatorId ? ' ※カスタム評価' : ''
          md += `- ${evaluee.name}（${evaluee.position}）`
          md += ` - ${evaluee.department} / ${evaluee.section || '本部直轄'}`
          if (evaluee.course) md += ` / ${evaluee.course}`
          md += `${isCustom}\n`
        })
        md += '\n'
      }
    })
    
    md += '## 評価関係の統計\n\n'
    md += `- **総社員数**: ${data.employees.length}名\n`
    md += `- **評価者数**: ${evaluatorMap.size}名\n`
    
    let customEvaluationCount = 0
    data.employees.forEach(emp => {
      if (emp.evaluatorId) customEvaluationCount++
    })
    md += `- **カスタム評価関係**: ${customEvaluationCount}件\n`
    
    md += '\n---\n'
    md += `*エクスポート日時: ${new Date().toLocaleString('ja-JP')}*\n`
    
    return md
  }

  // 3. CSV形式のデータ生成
  const generateCSV = (data: Organization): string => {
    const headers = [
      '社員ID', '氏名', '役職・職種', '本部', '部', '課', 'メール', '電話番号',
      '入社日', '生年月日', '資格等級', '評価者ID', '評価者名', '評価者役職・職種', '評価者所属', '評価関係タイプ'
    ]
    
    let csv = headers.join(',') + '\n'
    
    data.employees.forEach(emp => {
      // 評価者情報を取得
      let evaluatorId = emp.evaluatorId || null
      const evaluationType = emp.evaluatorId ? 'カスタム' : 'デフォルト'
      
      // デフォルト評価者を特定
      if (!evaluatorId) {
        if (emp.section === '') {
          const dept = data.departments.find(d => d.name === emp.department)
          if (dept && dept.managerId !== emp.id) {
            evaluatorId = dept.managerId
          }
        } else if (!emp.course) {
          data.departments.forEach(dept => {
            const section = dept.sections.find(s => s.name === emp.section)
            if (section && section.managerId !== emp.id) {
              evaluatorId = section.managerId
            }
          })
        } else {
          data.departments.forEach(dept => {
            dept.sections.forEach(section => {
              const course = section.courses.find(c => c.name === emp.course)
              if (course && course.managerId !== emp.id) {
                evaluatorId = course.managerId
              }
            })
          })
        }
      }
      
      const evaluator = evaluatorId ? data.employees.find(e => e.id === evaluatorId) : null
      
      const row = [
        emp.employeeId,
        emp.name,
        emp.position,
        emp.department,
        emp.section || '',
        emp.course || '',
        emp.email,
        emp.phone,
        emp.joinDate,
        emp.birthDate,
        emp.qualificationGrade || '',
        evaluatorId || '',
        evaluator ? evaluator.name : '',
        evaluator ? evaluator.position : '',
        evaluator ? `${evaluator.department} / ${evaluator.section || '本部直轄'}${evaluator.course ? ` / ${evaluator.course}` : ''}` : '',
        evaluationType
      ]
      
      csv += `"${row.join('","')}"\n`
    })
    
    return csv
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string)
          setOrganizationData(importedData)
          alert('データを正常に読み込みました。')
        } catch {
          alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。')
        }
      }
      reader.readAsText(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error || !organizationData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    )
  }

  // 認証されていない場合のレンダリング
  if (!isAuthenticated) {
    return <AccessTokenInput />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダーとタブナビゲーションの固定コンテナ */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* ツールバー */}
        <div className="border-b p-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              ORGANI - 組織管理アプリ
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  title="エクスポート"
                >
                  <FaUpload className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          exportData('organization-md')
                          setShowExportMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        </div>
                        <div>
                          <div className="font-medium">組織図（Markdown）</div>
                          <div className="text-xs text-gray-500 mt-1">組織構造に沿ったデータ出力</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          exportData('evaluation-md')
                          setShowExportMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                        <div>
                          <div className="font-medium">評価関係（Markdown）</div>
                          <div className="text-xs text-gray-500 mt-1">評価者と被評価者の関係データ</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          exportData('csv')
                          setShowExportMenu(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                        </div>
                        <div>
                          <div className="font-medium">統合データ（CSV）</div>
                          <div className="text-xs text-gray-500 mt-1">組織図と評価関係を含む全データ</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <label className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors cursor-pointer" title="インポート">
                <FaDownload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <div className="flex items-center gap-2">
                <div className={`flex items-center px-3 py-1 rounded text-sm ${
                  role === 'ADMIN' ? 'bg-red-50 border-red-200 text-red-600' :
                  role === 'EDITOR' ? 'bg-yellow-50 border-yellow-200 text-yellow-600' :
                  'bg-green-50 border-green-200 text-green-600'
                } border`}>
                  <span className="font-medium">{role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                  title="ログアウト"
                >
                  <FaSignOutAlt size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('organization')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'organization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaSitemap className="w-4 h-4" />
                組織図
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaSearch className="w-4 h-4" />
                社員検索
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaChartBar className="w-4 h-4" />
                分析
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6 mt-[140px]">
        {activeTab === 'analytics' ? (
          <OrganizationAnalytics organization={organizationData} />
        ) : activeTab === 'search' ? (
          <EmployeeSearch
            organization={organizationData}
            onUpdateEmployee={(employee) => {
              const updatedEmployees = organizationData.employees.map(emp =>
                emp.id === employee.id ? employee : emp
              )
              handleDataUpdate({ ...organizationData, employees: updatedEmployees })
            }}
            onUpdateOrganization={handleDataUpdate}
          />
        ) : (
          <div className="space-y-6">
            {/* 組織図タブ専用のコントロール */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">組織図</h2>
              <div className="flex items-center gap-2">
                {canWrite() && (
                  <button
                    onClick={toggleEditMode}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      isEditMode
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title={isEditMode ? '表示モード' : '編集モード'}
                  >
                    <FaEdit className="w-4 h-4" />
                    {isEditMode ? '表示モード' : '編集モード'}
                  </button>
                )}
                {role === 'ADMIN' && (
                  <button
                    onClick={() => setShowAuthTestPanel(!showAuthTestPanel)}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      showAuthTestPanel
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    title="認可APIテスト画面"
                  >
                    <FaKey className="w-4 h-4" />
                    APIテスト
                  </button>
                )}
              </div>
            </div>

            {/* 組織図コンテンツ */}
            {isEditMode ? (
              <DndOrganizationChart
                organization={organizationData}
                onDataUpdate={handleDataUpdate}
              />
            ) : (
              <OrganizationChart
                organization={organizationData}
                onDataUpdate={handleDataUpdate}
              />
            )}
          </div>
        )}
      </div>

      {/* APIテストモーダル */}
      {role === 'ADMIN' && (
        <AuthorizationTestPanel
          isOpen={showAuthTestPanel}
          onClose={() => setShowAuthTestPanel(false)}
        />
      )}
    </div>
  )
}
