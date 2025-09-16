import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { Organization } from '../../../types/organization'

// メモリ内データストレージ（Vercel対応）
let organizationData: Organization | null = null

// 初期データの読み込み
async function loadInitialData(): Promise<Organization> {
  if (organizationData) {
    return organizationData
  }

  try {
    // ビルド時に含まれる静的ファイルから読み込み - ルートディレクトリのdataフォルダから読み込み
    const DATA_FILE_PATH = '/Users/matsbaccano/projects/clone/organi/data/organization-data.json'
    const fileContents = await readFile(DATA_FILE_PATH, 'utf8')
    const parsedData: Organization = JSON.parse(fileContents)
    organizationData = parsedData
    return parsedData
  } catch (error) {
    console.error('初期データファイルの読み込みエラー:', error)
    
    // フォールバック用のデフォルトデータ
    const fallbackData: Organization = {
      id: 'org-001',
      name: '組織図管理アプリ（デモ）',
      departments: [
        {
          id: 'dept-001',
          name: 'サンプル本部',
          manager: 'サンプル本部長',
          managerId: 'emp-001',
          sections: [
            {
              id: 'sect-001',
              name: 'サンプル部',
              manager: 'サンプル部長',
              managerId: 'emp-002',
              courses: [
                {
                  id: 'course-001',
                  name: 'サンプル課',
                  manager: '山田太郎',
                  managerId: 'emp-003'
                }
              ]
            }
          ]
        }
      ],
      employees: [
        {
          id: 'emp-001',
          name: 'サンプル本部長',
          position: '本部長',
          department: 'サンプル本部',
          section: '',
          email: 'demo@example.com',
          phone: '000-0000-0000',
          employeeId: 'D001',
          joinDate: '2020-04-01',
          birthDate: '1980-01-01',
          qualificationGrade: 'SA'
        },
        {
          id: 'emp-002',
          name: 'サンプル部長',
          position: '部長',
          department: 'サンプル本部',
          section: 'サンプル部',
          email: 'demo2@example.com',
          phone: '000-0000-0001',
          employeeId: 'D002',
          joinDate: '2021-04-01',
          birthDate: '1985-01-01',
          qualificationGrade: 'S3'
        },
        {
          id: 'emp-003',
          name: '山田太郎',
          position: '課長',
          department: 'サンプル本部',
          section: 'サンプル部',
          course: 'サンプル課',
          email: 'yamada@example.com',
          phone: '000-0000-0002',
          employeeId: 'D003',
          joinDate: '2022-04-01',
          birthDate: '1990-01-01',
          qualificationGrade: 'G1'
        },
        {
          id: 'emp-004',
          name: '佐藤花子',
          position: '一般職',
          department: 'サンプル本部',
          section: 'サンプル部',
          course: 'サンプル課',
          email: 'sato@example.com',
          phone: '000-0000-0003',
          employeeId: 'D004',
          joinDate: '2023-04-01',
          birthDate: '1995-01-01',
          qualificationGrade: 'G3'
        },
        {
          id: 'emp-005',
          name: '鈴木次郎',
          position: '一般職',
          department: 'サンプル本部',
          section: 'サンプル部',
          course: 'サンプル課',
          email: 'suzuki@example.com',
          phone: '000-0000-0004',
          employeeId: 'D005',
          joinDate: '2023-10-01',
          birthDate: '1992-01-01',
          qualificationGrade: 'G3'
        }
      ]
    }
    
    organizationData = fallbackData
    return fallbackData
  }
}

export async function GET() {
  try {
    const data = await loadInitialData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('データの取得エラー:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: Organization = await request.json()
    
    // メモリ内のデータを更新（Vercelではファイル書き込み不可）
    organizationData = data
    
    console.log('組織データをメモリ内で更新しました')
    
    return NextResponse.json({ 
      success: true, 
      message: '組織データが正常に保存されました（セッション内で有効）',
      note: 'Vercel環境では変更はセッション内でのみ保持されます'
    })
  } catch (error) {
    console.error('データの更新エラー:', error)
    return NextResponse.json(
      { error: 'データの保存に失敗しました' },
      { status: 500 }
    )
  }
}