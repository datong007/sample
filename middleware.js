import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 只处理管理后台路径，但排除登录页面和静态资源
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/login' && 
      !pathname.includes('.')) {
    try {
      const token = request.cookies.get('adminToken')

      if (!token) {
        // 没有token，重定向到登录页
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      try {
        // 验证token
        await jwtVerify(token.value, JWT_SECRET)
        return NextResponse.next()
      } catch (error) {
        // token无效，重定向到登录页
        console.error('Token验证失败:', error)
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (error) {
      console.error('认证失败:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有以/admin开头的路径，
     * 但是不匹配/admin/login和静态资源
     */
    '/admin/:path*',
  ]
} 