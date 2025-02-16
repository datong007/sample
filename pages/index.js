import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import ChatButton from '../components/ChatButton'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.techLines}></div>
      <div className={styles.shootingStar}></div>
      <div className={styles.shootingStar}></div>
      <div className={styles.shootingStar}></div>
      <div className={styles.shootingStar}></div>

      <Head>
        <title>样品管理系统</title>
        <meta name="description" content="浏览和管理样品" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          欢迎来到样品采购平台
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

      <ChatButton />
    </div>
  )
} 