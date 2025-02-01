import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

// 需要保护的 API 路径（只有管理员可以访问）
const PROTECTED_PATHS = [
  '/api/products/create',
  '/api/products/delete',
  '/api/products/update',
  '/api/orders/update',
  '/api/orders/delete',
  '/api/stock/update',
  '/api/upload'
]

// 公开访问的 API 路径
const PUBLIC_PATHS = [
  '/api/products/list',
  '/api/orders/create',
  '/api/orders/list',
  '/api/stock/get'
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 如果是公开路径，直接放行
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 检查是否是需要保护的 API 路径
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    try {
      const token = request.cookies.get('adminToken')

      if (!token) {
        return new NextResponse(
          JSON.stringify({ message: '未授权访问' }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }

      try {
        await jwtVerify(token.value, JWT_SECRET)
        return NextResponse.next()
      } catch (error) {
        console.error('Token验证失败:', error)
        return new NextResponse(
          JSON.stringify({ message: 'Token无效' }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    } catch (error) {
      console.error('API认证失败:', error)
      return new NextResponse(
        JSON.stringify({ message: '认证失败' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }

  // 其他路径默认放行
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
} 