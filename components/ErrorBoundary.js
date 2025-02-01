import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          color: '#ef4444'
        }}>
          <h2>出错了！</h2>
          <p>请刷新页面或联系管理员</p>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: '#fee2e2',
              borderRadius: '0.5rem',
              overflow: 'auto'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 