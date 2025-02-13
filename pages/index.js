import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>样品管理系统</title>
        <meta name="description" content="浏览和管理样品" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          欢迎使用样品管理系统
        </h1>

        <div className={styles.grid}>
          <Link href="/products" className={styles.card}>
            <h2>浏览样品 &rarr;</h2>
            <p>查看所有可用的样品</p>
          </Link>

          <Link href="/sample-list" className={styles.card}>
            <h2>我的样品单 &rarr;</h2>
            <p>查看已选择的样品</p>
          </Link>
        </div>
      </main>
    </div>
  )
} 