import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../styles/AdminOrders.module.css'
import { ORDER_STATUS, STATUS_MAP } from '../../constants/orderStatus'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statusOptions = {
    all: '全部',
    [ORDER_STATUS.PENDING]: STATUS_MAP[ORDER_STATUS.PENDING].text,
    [ORDER_STATUS.PROCESSING]: STATUS_MAP[ORDER_STATUS.PROCESSING].text,
    [ORDER_STATUS.COMPLETED]: STATUS_MAP[ORDER_STATUS.COMPLETED].text,
    [ORDER_STATUS.CANCELLED]: STATUS_MAP[ORDER_STATUS.CANCELLED].text
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

  // 获取可用的下一个状态选项
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case ORDER_STATUS.PENDING:
        return [
          ORDER_STATUS.PENDING,
          ORDER_STATUS.PROCESSING,
          ORDER_STATUS.COMPLETED
        ]
      case ORDER_STATUS.PROCESSING:
        return [
          ORDER_STATUS.PROCESSING,
          ORDER_STATUS.COMPLETED
        ]
      case ORDER_STATUS.COMPLETED:
        return [ORDER_STATUS.COMPLETED]
      case ORDER_STATUS.CANCELLED:
        return [ORDER_STATUS.CANCELLED]
      default:
        return [ORDER_STATUS.PENDING]
    }
  }

  const handleStatusChange = async (orderNumber, newStatus, currentStatus) => {
    // 如果订单已取消或已完成，则不允许修改状态
    if (currentStatus === ORDER_STATUS.CANCELLED || currentStatus === ORDER_STATUS.COMPLETED) {
      return
    }

    // 验证状态流转是否合法
    const availableStatuses = getAvailableStatuses(currentStatus)
    if (!availableStatuses.includes(newStatus)) {
      alert('不允许的状态变更')
      return
    }

    try {
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('更新状态失败')
      }

      // 更新本地状态
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderNumber === orderNumber 
            ? { ...order, status: newStatus }
            : order
        )
      )

      // 广播状态更新事件
      const event = new CustomEvent('orderStatusChanged', {
        detail: { orderNumber, status: newStatus }
      })
      window.dispatchEvent(event)
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
                    {order.status === ORDER_STATUS.CANCELLED || order.status === ORDER_STATUS.COMPLETED ? (
                      // 已取消或已完成订单显示状态标签
                      <div className={`${styles.statusLabel} ${styles[order.status]}`}>
                        {STATUS_MAP[order.status].text}
                      </div>
                    ) : (
                      // 其他状态显示下拉选择框
                      <select
                        value={order.status || ORDER_STATUS.PENDING}
                        onChange={(e) => handleStatusChange(order.orderNumber, e.target.value, order.status)}
                        className={`${styles.statusSelect} ${styles[STATUS_MAP[order.status]?.class || STATUS_MAP[ORDER_STATUS.PENDING].class]}`}
                      >
                        {getAvailableStatuses(order.status).map(status => (
                          <option key={status} value={status}>
                            {STATUS_MAP[status].text}
                          </option>
                        ))}
                      </select>
                    )}
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
                          src={item.image || '/images/no-image.png'}
                          alt={item.name}
                          className={styles.productImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/no-image.png';
                            e.target.style.backgroundColor = '#f7fafc';
                            e.target.style.border = '1px solid #e2e8f0';
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