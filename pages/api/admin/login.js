import { SignJWT } from 'jose'
import { serialize } from 'cookie'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    // 验证用户名和密码
    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
      // 生成 JWT token
      const token = await new SignJWT({ 
        username,
        role: 'admin'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET)

      // 设置 cookie
      res.setHeader('Set-Cookie', serialize('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 24小时
        path: '/'
      }))

      return res.status(200).json({ success: true })
    }

    res.status(401).json({ message: '用户名或密码错误' })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ message: '登录失败，请重试' })
  }
} 