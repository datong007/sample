import { useState, useEffect } from 'react'
import styles from '../styles/OrderHistory.module.css'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      } else {
        setError('获取订单历史失败')
      }
    } catch (error) {
      console.error('获取订单历史失败:', error)
      setError('获取订单历史失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(selectedOrder?.orderNumber === order.orderNumber ? null : order)
  }

  const handleImageError = (e) => {
    if (!e.target.src.includes('placeholder.jpg')) {
      e.target.src = '/images/placeholder.jpg'
    }
  }

  if (loading) return <div className={styles.loading}>加载中...</div>
  if (error) return <div className={styles.error}>{error}</div>
  if (orders.length === 0) return <div className={styles.empty}>暂无历史订单</div>

  return (
    <div className={styles.orderHistory}>
      <h2>历史订单</h2>
      <div className={styles.orderList}>
        {orders.map(order => (
          <div key={order.orderNumber} className={styles.orderCard}>
            <div 
              className={`${styles.orderHeader} ${styles.clickable}`}
              onClick={() => handleViewDetails(order)}
            >
              <div className={styles.orderInfo}>
                <h3>订单号：{order.orderNumber}</h3>
                <p className={styles.orderDate}>
                  提交时间：{new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
              <div className={styles.headerRight}>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status === 'pending' ? '处理中' : 
                   order.status === 'approved' ? '已通过' : 
                   order.status === 'rejected' ? '已拒绝' : '未知状态'}
                </span>
                <svg 
                  className={`${styles.arrow} ${selectedOrder?.orderNumber === order.orderNumber ? styles.expanded : ''}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {selectedOrder?.orderNumber === order.orderNumber && (
              <div className={styles.orderDetails}>
                <div className={styles.orderSummary}>
                  <div className={styles.itemCount}>
                    样品数量：{order.items.length}
                  </div>
                  <div className={styles.contactInfo}>
                    <p>联系人：{order.contactInfo.name}</p>
                    <p>电话：{order.contactInfo.phone}</p>
                    <p>邮箱：{order.contactInfo.email}</p>
                    {order.contactInfo.company && (
                      <p>公司：{order.contactInfo.company}</p>
                    )}
                  </div>
                </div>

                <div className={styles.itemList}>
                  {order.items.map(item => (
                    <div key={item.id} className={styles.item}>
                      <div className={styles.itemImage}>
                        <img 
                          src={item.image || '/images/placeholder.jpg'} 
                          alt={item.name}
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <h4>{item.name}</h4>
                        <p className={styles.itemModel}>编号: {item.model}</p>
                        {item.selectedVariants && Object.entries(item.selectedVariants).map(([key, value]) => (
                          <span key={key} className={styles.variant}>
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                      <div className={styles.itemQuantity}>
                        数量: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {order.contactInfo.notes && (
                  <div className={styles.notes}>
                    <h4>备注</h4>
                    <p>{order.contactInfo.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 