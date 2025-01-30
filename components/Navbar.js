import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import styles from '../styles/Navbar.module.css'

export default function Navbar() {
  const { cart } = useCart()
  const router = useRouter()
  
  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0)
  const isHomePage = router.pathname === '/'

  if (isHomePage) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.links}>
          <Link href="/" className={styles.homeLink}>
            返回首页
          </Link>
          <Link href="/products">浏览样品</Link>
          <div className={styles.cartContainer}>
            <Link href="/sample-list" className={styles.cartLink}>
              <svg>...</svg>
              {itemCount > 0 && (
                <span className={styles.cartBadge}>
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>首页</Link>
          <Link href="/products" className={styles.navLink}>样品展示</Link>
          <Link href="/sample-list" className={styles.navLink}>样品申请单</Link>
          <Link href="/admin/upload" className={styles.navLink}>图片管理</Link>
        </div>
      </div>
    </nav>
  )
} 