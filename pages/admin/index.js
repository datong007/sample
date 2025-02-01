import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Admin.module.css'

export default function AdminHome() {
  return (
    <div className={styles.container}>
      <Head>
        <title>管理后台 - 样品管理系统</title>
        <meta name="description" content="样品管理系统后台" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>样品管理系统后台</h1>

        <div className={styles.grid}>
          <Link href="/admin/upload" className={styles.card}>
            <h2>图片上传 &rarr;</h2>
            <p>上传和管理样品图片</p>
          </Link>
          
          {/* 可以添加其他管理功能入口 */}
        </div>
      </main>
    </div>
  )
} 