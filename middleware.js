import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 所有路径直接放行
  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/api/:path*']
} 