import Link from 'next/link'
import styles from '../styles/AdminLayout.module.css'

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminContainer}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>管理后台</h1>
        </div>
        <ul className={styles.menu}>
          <li>
            <Link href="/admin" className={styles.menuItem}>
              首页
            </Link>
          </li>
          <li>
            <Link href="/admin/upload" className={styles.menuItem}>
              产品上传
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className={styles.menuItem}>
              产品管理
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className={styles.menuItem}>
              订单管理
            </Link>
          </li>
        </ul>
      </nav>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
} 