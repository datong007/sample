import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../../styles/Admin.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        if (!res.ok) {
          throw new Error('Not authenticated')
        }
        setLoading(false)
      } catch (error) {
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>后台管理系统</h1>
        <nav className={styles.nav}>
          <button 
            onClick={() => router.push('/admin/products')}
            className={styles.navButton}
          >
            产品管理
          </button>
          <button 
            onClick={() => router.push('/admin/orders')}
            className={styles.navButton}
          >
            订单管理
          </button>
          <button 
            onClick={() => router.push('/admin/upload')}
            className={styles.navButton}
          >
            产品上传
          </button>
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/admin/login')
            }}
            className={styles.logoutButton}
          >
            退出登录
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h2>欢迎使用后台管理系统</h2>
          <p>请选择上方功能进行操作</p>
        </div>
      </main>
    </div>
  )
} 