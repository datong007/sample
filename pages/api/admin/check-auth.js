import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.cookies.adminToken

    if (!token) {
      return res.status(401).json({ message: '未登录' })
    }

    try {
      // 验证token
      await jwtVerify(token, JWT_SECRET)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Token验证失败:', error)
      res.status(401).json({ message: 'Token无效' })
    }
  } catch (error) {
    console.error('认证检查失败:', error)
    res.status(401).json({ message: '认证失败' })
  }
} 