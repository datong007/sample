import styles from '../styles/Loading.module.css'
import { useState, useEffect } from 'react'

export default function Loading({ timeout = 10000 }) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowError(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout])

  if (showError) {
    return (
      <div className={styles.errorContainer}>
        <p>加载超时，请刷新页面重试</p>
        <button onClick={() => window.location.reload()}>
          刷新页面
        </button>
      </div>
    )
  }

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>加载中...</p>
    </div>
  )
} 