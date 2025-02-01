import { useState, useEffect } from 'react'
import { getOrders } from '../lib/db'
import styles from '../styles/OrderHistory.module.css'
import { ORDER_STATUS, STATUS_MAP } from '../constants/orderStatus'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [cancellingOrders, setCancellingOrders] = useState(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const orderList = await getOrders()
      setOrders(orderList)
    } catch (error) {
      console.error('获取订单历史失败:', error)
      setError('获取订单历史失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  // 监听订单状态变化
  useEffect(() => {
    const handleStatusChange = (event) => {
      const { orderNumber, status } = event.detail
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status }
            : order
        )
      )
    }

    window.addEventListener('orderStatusChanged', handleStatusChange)
    return () => window.removeEventListener('orderStatusChanged', handleStatusChange)
  }, [])

  const handleCancelOrder = async (orderNumber) => {
    if (!confirm('确定要取消这个订单吗？')) {
      return
    }

    try {
      setCancellingOrders(prev => new Set([...prev, orderNumber]))
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: ORDER_STATUS.CANCELLED }),
      })

      if (!response.ok) {
        throw new Error('取消订单失败')
      }

      // 更新本地状态
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status: ORDER_STATUS.CANCELLED }
            : order
        )
      )
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败，请重试')
    } finally {
      setCancellingOrders(prev => {
        const next = new Set(prev)
        next.delete(orderNumber)
        return next
      })
    }
  }

  if (loading) {
    return <div className={styles.loading}>加载中...</div>
  }

  if (error) {
    return (
      <div className={styles.error}>
        {error}
        <button onClick={fetchOrders} className={styles.retryButton}>
          重试
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className={styles.empty}>暂无订单记录</div>
  }

  return (
    <div className={styles.container}>
      <h2>历史订单</h2>
      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.orderNumber} className={styles.orderItem}>
            <div className={styles.orderHeader}>
              <span>订单号: {order.orderNumber}</span>
              <span>状态: {order.status}</span>
            </div>
            <div className={styles.orderDate}>
              下单时间: {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className={styles.items}>
              {order.items.map((item, index) => (
                <div key={index} className={styles.item}>
                  <span>{item.name}</span>
                  <span>x {item.quantity}</span>
                </div>
              ))}
            </div>
            <div className={styles.headerButtons}>
              <span className={`${styles.status} ${styles[STATUS_MAP[order.status]?.class || 'pending']}`}>
                {STATUS_MAP[order.status]?.text || '待处理'}
              </span>
              {order.status === ORDER_STATUS.PENDING && (
                <button
                  onClick={() => handleCancelOrder(order.orderNumber)}
                  className={styles.cancelButton}
                  disabled={cancellingOrders.has(order.orderNumber)}
                >
                  {cancellingOrders.has(order.orderNumber) ? '取消中...' : '取消订单'}
                </button>
              )}
              <button
                className={styles.detailsButton}
                onClick={() => setExpandedOrder(expandedOrder === order.orderNumber ? null : order.orderNumber)}
              >
                {expandedOrder === order.orderNumber ? '收起详情' : '查看详情'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {expandedOrder && (
        <div className={styles.expandedOrder}>
          <div className={styles.orderDetails}>
            <div className={styles.contactInfo}>
              <h4>联系信息</h4>
              <p><strong>联系人：</strong>{order.contactInfo.name}</p>
              <p><strong>电话：</strong>{order.contactInfo.phone}</p>
              <p><strong>邮箱：</strong>{order.contactInfo.email}</p>
              {order.contactInfo.company && (
                <p><strong>公司：</strong>{order.contactInfo.company}</p>
              )}
              {order.contactInfo.notes && (
                <p><strong>备注：</strong>{order.contactInfo.notes}</p>
              )}
            </div>

            <div className={styles.itemList}>
              <h4>样品清单</h4>
              {order.items.map((item, index) => (
                <div key={index} className={styles.item}>
                  <div className={styles.itemImage}>
                    <img src={item.image || '/images/no-image.png'} alt={item.name} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h5>{item.name}</h5>
                    <p className={styles.itemModel}>型号：{item.model}</p>
                    {item.specs && Object.keys(item.specs).length > 0 && (
                      <div className={styles.specs}>
                        {Object.entries(item.specs).map(([key, value]) => (
                          value && <span key={key} className={styles.spec}>{key}: {value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.itemQuantity}>
                    数量：{item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 