import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Admin.module.css'

export default function AdminHome() {
  const router = useRouter()

  useEffect(() => {
    // 检查是否有管理员token
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check-auth')
        if (!res.ok) {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('认证检查失败:', error)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router])

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