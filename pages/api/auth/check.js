import { jwtVerify } from 'jose';
import { parse } from 'cookie';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parse(cookieHeader);
    const token = cookies.auth;

    console.log('Checking auth token:', { 
      hasCookies: !!cookieHeader,
      hasToken: !!token,
      cookies: cookies
    });

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: '未登录' 
      });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log('Token verified successfully:', payload);
      
      return res.status(200).json({ 
        success: true,
        message: '已登录',
        user: {
          username: payload.username,
          role: payload.role
        }
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Token无效',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return res.status(401).json({ 
      success: false,
      message: '认证失败',
      error: error.message 
    });
  }
} 