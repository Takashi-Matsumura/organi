'use client'

import { useState, useEffect } from 'react'
import { OrganizationChart } from '../components/OrganizationChart'
import { DndOrganizationChart } from '../components/DndOrganizationChart'
import { Organization } from '../types/organization'
import { FaEdit, FaDownload, FaUpload } from 'react-icons/fa'

const loadOrganizationData = async (): Promise<Organization> => {
  try {
    const response = await fetch('/api/organization')
    if (!response.ok) {
      throw new Error('データファイルの読み込みに失敗しました')
    }
    return await response.json()
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

  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await loadOrganizationData()
        setOrganizationData(data)
      } catch {
        setError('組織データの読み込みに失敗しました。ページを再読み込みしてください。')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
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

  const exportData = () => {
    if (!organizationData) return
    const markdownContent = generateMarkdown(organizationData)
    const dataBlob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'organization-data.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateMarkdown = (data: Organization): string => {
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
    md += '| 社員ID | 名前 | 部署 | 部 | 課 | 役職 | メール | 電話番号 | 入社日 | 生年月日 |\n'
    md += '|--------|------|------|-----|-----|------|-------|---------|----------|-----------|\n'
    
    data.employees.forEach((emp) => {
      md += `| ${emp.employeeId} | ${emp.name} | ${emp.department} | ${emp.section || '-'} | ${emp.course || '-'} | ${emp.position} | ${emp.email} | ${emp.phone} | ${emp.joinDate} | ${emp.birthDate} |\n`
    })
    
    md += '\n\n'
    md += '---\n'
    md += `*エクスポート日時: ${new Date().toLocaleString('ja-JP')}*\n`
    
    return md
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
        } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ツールバー */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            {organizationData.name} - 組織データ管理
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <FaEdit className="w-4 h-4" />
              {isEditMode ? '表示モード' : '編集モード'}
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              エクスポート
            </button>
            <label className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-2">
              <FaUpload className="w-4 h-4" />
              インポート
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6">
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
    </div>
  )
}
