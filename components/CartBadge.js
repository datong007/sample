import Link from 'next/link'
import { useCart } from '../context/CartContext'
import styles from '../styles/CartBadge.module.css'

export default function CartBadge() {
  const { cart } = useCart()
  const itemCount = cart?.items?.length || 0

  return (
    <Link href="/sample-list" className={styles.cartBadge}>
      <div className={styles.iconWrapper}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {itemCount > 0 && (
          <span className={styles.badge}>{itemCount}</span>
        )}
      </div>
      <span className={styles.text}>样品单</span>
    </Link>
  )
} 