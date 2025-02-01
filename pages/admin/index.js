import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Admin.module.css'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (!response.ok) {
        throw new Error('未登录')
      }
      setIsAuthenticated(true)
    } catch (error) {
      console.error('验证失败:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>管理后台 - 样品管理系统</title>
        <meta name="description" content="样品管理系统后台" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>样品管理系统后台</h1>

        <div className={styles.grid}>
          <Link href="/admin/products" className={styles.card}>
            <h2>产品管理 &rarr;</h2>
            <p>管理所有样品产品</p>
          </Link>

          <Link href="/admin/orders" className={styles.card}>
            <h2>订单管理 &rarr;</h2>
            <p>查看和处理样品申请</p>
          </Link>

          <Link href="/admin/upload" className={styles.card}>
            <h2>图片上传 &rarr;</h2>
            <p>上传和管理样品图片</p>
          </Link>
        </div>
      </main>
    </div>
  )
} 