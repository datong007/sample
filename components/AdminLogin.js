import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/AdminLogin.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Login successful, redirecting...');
        // 验证登录状态后再跳转
        const checkResponse = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        
        if (checkResponse.ok) {
          router.push('/admin');
        } else {
          setError('登录验证失败，请重试');
        }
      } else {
        console.error('Login failed:', data);
        setError(data.message || '登录失败，请重试');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>管理员登录</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
} 