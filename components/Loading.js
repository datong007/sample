import styles from '../styles/Loading.module.css'
import { useState, useEffect } from 'react'

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.8)',
      zIndex: 9999
    }}>
      <div style={{
        padding: '2rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        加载中...
      </div>
    </div>
  )
} 