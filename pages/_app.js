import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/globals.css'
import { CartProvider } from '../context/CartContext'
import { useEffect } from 'react'
import { validateEnv } from '../utils/validateEnv'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 全局错误处理
    const handleError = (error) => {
      console.error('Global error:', error)
      // 可以添加错误报告服务
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    try {
      validateEnv()
    } catch (error) {
      console.error('Environment validation failed:', error)
    }

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  return (
    <ErrorBoundary>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </ErrorBoundary>
  )
}

export default MyApp 