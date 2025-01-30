import Head from 'next/head'
import Navbar from './Navbar'
import styles from '../styles/AdminLayout.module.css'

export default function AdminLayout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>管理后台</title>
        <meta name="description" content="管理后台" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
} 