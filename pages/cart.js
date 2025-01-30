import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import styles from '../styles/Cart.module.css'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [orderNumber, setOrderNumber] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  const generateOrderNumber = () => {
    const date = new Date()
    const timestamp = date.getTime()
    const random = Math.floor(Math.random() * 1000)
    return `SO${timestamp}${random}`
  }

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)
      const newOrderNumber = generateOrderNumber()
      
      // 准备订单数据
      const orderData = {
        orderNumber: newOrderNumber,
        orderDate: new Date().toISOString(),
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          specs: item.specs,
          stock: item.stock // 添加库存信息
        })),
        totalItems,
        status: 'pending'
      }

      // 更新库存
      const stockUpdateResponse = await fetch('/api/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart.items }),
      })

      if (!stockUpdateResponse.ok) {
        throw new Error('库存更新失败')
      }

      // 提交订单
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!orderResponse.ok) {
        throw new Error('提交订单失败')
      }

      const result = await orderResponse.json()
      
      if (result.success) {
        setOrderNumber(newOrderNumber)
        alert(`样品选择已确认！\n订单号：${newOrderNumber}`)
        clearCart() // 使用新添加的 clearCart 函数
      } else {
        throw new Error(result.message || '提交失败')
      }
      
    } catch (error) {
      console.error('提交订单失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>样品选择</title>
        <meta name="description" content="已选择的样品" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>已选样品</h1>
        
        {orderNumber && (
          <div className={styles.orderInfo}>
            <p>订单号: {orderNumber}</p>
            <p>订单状态: 处理中</p>
          </div>
        )}
        
        {cart.items.length === 0 ? (
          <div className={styles.empty}>
            <p>还未选择任何样品</p>
            <Link href="/products" className={styles.continueButton}>
              选择样品
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.cartItems}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <div className={styles.specs}>
                      {item.specs.map((spec, index) => (
                        <span key={index} className={styles.spec}>{spec}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantity}>
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className={`${styles.quantityButton} ${isSubmitting ? styles.disabledButton : ''}`}
                        disabled={isSubmitting}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={`${styles.quantityButton} ${isSubmitting ? styles.disabledButton : ''}`}
                        disabled={isSubmitting}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className={`${styles.removeButton} ${isSubmitting ? styles.disabledButton : ''}`}
                      disabled={isSubmitting}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <div className={styles.total}>
                已选样品: {totalItems} 件
              </div>
              <button 
                className={`${styles.confirmButton} ${isSubmitting ? styles.submitting : ''} ${isSubmitting ? styles.disabledButton : ''}`}
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '确认样品'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
} 