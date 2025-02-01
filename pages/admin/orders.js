import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../styles/AdminOrders.module.css'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = {
    all: '全部',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setError(null)
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('获取订单列表失败')
      }
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('更新状态失败')
      }

      // 刷新订单列表
      fetchOrders()
    } catch (error) {
      console.error('更新状态失败:', error)
      alert('更新状态失败，请重试')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    if (!searchTerm) return matchesStatus
    
    const searchLower = searchTerm.toLowerCase()
    return matchesStatus && (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.contactInfo?.name?.toLowerCase().includes(searchLower) ||
      order.contactInfo?.company?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>订单管理</h1>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="搜索订单号/客户名称/公司..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statusFilter}>
            {Object.entries(statusOptions).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSelectedStatus(value)}
                className={`${styles.statusButton} ${
                  selectedStatus === value ? styles.active : ''
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchOrders} className={styles.retryButton}>
              重试
            </button>
          </div>
        ) : (
          <div className={styles.orderList}>
            {filteredOrders.map((order) => (
              <div key={order.orderNumber} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3>订单号：{order.orderNumber}</h3>
                    <p className={styles.orderDate}>
                      提交时间：{new Date(order.orderDate).toLocaleString()}
                    </p>
                  </div>
                  <div className={styles.statusSection}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                      className={`${styles.statusSelect} ${styles[order.status]}`}
                    >
                      {Object.entries(statusOptions).filter(([key]) => key !== 'all').map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.contactInfo}>
                  <p><strong>联系人：</strong>{order.contactInfo.name}</p>
                  <p><strong>电话：</strong>{order.contactInfo.phone}</p>
                  <p><strong>邮箱：</strong>{order.contactInfo.email}</p>
                  {order.contactInfo.company && (
                    <p><strong>公司：</strong>{order.contactInfo.company}</p>
                  )}
                </div>

                <div className={styles.itemList}>
                  <h4>样品清单</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className={styles.item}>
                      <div className={styles.itemImage}>
                        <img
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg'
                          }}
                        />
                      </div>
                      <div className={styles.itemDetails}>
                        <h5>{item.name}</h5>
                        <p className={styles.itemModel}>编号：{item.model}</p>
                        <div className={styles.specs}>
                          {Object.entries(item.specs || {}).map(([key, value]) => (
                            value && (
                              <span key={key} className={styles.spec}>
                                {key}: {value}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                      <div className={styles.itemQuantity}>
                        数量：{item.quantity}
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
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 