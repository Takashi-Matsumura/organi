import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { Organization } from '../../../types/organization'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'organization-data.json')
const PUBLIC_DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'organization-data.json')

export async function GET() {
  try {
    const fileContents = await readFile(DATA_FILE_PATH, 'utf8')
    const data: Organization = JSON.parse(fileContents)
    return NextResponse.json(data)
  } catch (error) {
    console.error('データファイルの読み込みエラー:', error)
    return NextResponse.json(
      { error: 'データファイルの読み込みに失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: Organization = await request.json()
    
    const jsonString = JSON.stringify(data, null, 2)
    
    await writeFile(DATA_FILE_PATH, jsonString, 'utf8')
    await writeFile(PUBLIC_DATA_FILE_PATH, jsonString, 'utf8')
    
    return NextResponse.json({ success: true, message: '組織データが正常に保存されました' })
  } catch (error) {
    console.error('データファイルの書き込みエラー:', error)
    return NextResponse.json(
      { error: 'データファイルの保存に失敗しました' },
      { status: 500 }
    )
  }
}