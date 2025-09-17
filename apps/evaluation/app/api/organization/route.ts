import { NextResponse } from 'next/server';

// 組織管理アプリからデータを取得するAPIルート
export async function GET() {
  try {
    const response = await fetch('http://localhost:3000/api/organization', {
      cache: 'no-store', // キャッシュを無効にする
    });

    if (!response.ok) {
      console.error('Failed to fetch from organization API:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch organization data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // CORSヘッダーを追加
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error in organization API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}