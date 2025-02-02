import { useState, useEffect } from 'react'
import styles from '../styles/Orders.module.css'
import { formatDate } from '../utils/date'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '获取订单失败')
      }

      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      } else {
        throw new Error(data.message || '获取订单失败')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>加载中...</div>
  }

  if (error) {
    return <div className={styles.error}>错误: {error}</div>
  }

  if (!orders.length) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>暂无订单记录</h2>
          <p>您还没有提交过任何样品申请</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>历史订单</h1>
      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <span className={styles.orderNumber}>
                订单号：{order.orderNumber}
              </span>
              <span className={styles.orderDate}>
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div className={styles.orderItems}>
              {order.items.map((item, index) => (
                <div key={index} className={styles.item}>
                  <div className={styles.itemImage}>
                    <img 
                      src={item.image || '/images/placeholder.jpg'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/images/placeholder.jpg'
                      }}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div className={styles.itemSpecs}>
                      {item.specs && Object.entries(item.specs).map(([key, value]) => (
                        value && (
                          <span key={key} className={styles.spec}>
                            <span className={styles.specLabel}>{key}:</span>
                            <span className={styles.specValue}>{value}</span>
                          </span>
                        )
                      ))}
                    </div>
                    <div className={styles.itemQuantity}>
                      数量：{item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.orderStatus}>
              <span className={`${styles.status} ${styles[order.status]}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getStatusText(status) {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
} 