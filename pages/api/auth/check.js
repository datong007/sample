import { jwtVerify } from 'jose';
import { parse } from 'cookie';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies.auth;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
} 