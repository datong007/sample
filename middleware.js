import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 只处理管理后台路径
  if (pathname.startsWith('/admin')) {
    // 登录页面不需要验证
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const token = request.cookies.get('adminToken')

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // 使用 jose 验证 token
      await jwtVerify(token.value, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: '/admin/:path*'
} 