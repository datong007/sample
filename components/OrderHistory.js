import { useState } from 'react'
import styles from '../styles/OrderHistory.module.css'

export default function OrderHistory({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null)

  if (!orders || orders.length === 0) {
    return (
      <div className={styles.emptyHistory}>
        <p>暂无历史订单</p>
      </div>
    )
  }

  return (
    <div className={styles.historyContainer}>
      {orders.map((order) => (
        <div key={order.orderNumber} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div className={styles.orderInfo}>
              <span className={styles.orderNumber}>订单号：{order.orderNumber}</span>
              <span className={styles.orderDate}>
                提交时间：{new Date(order.orderDate).toLocaleString()}
              </span>
            </div>
            <div className={styles.headerButtons}>
              <button
                className={styles.detailsButton}
                onClick={() => setSelectedOrder(selectedOrder?.orderNumber === order.orderNumber ? null : order)}
              >
                {selectedOrder?.orderNumber === order.orderNumber ? '收起详情' : '查看详情'}
              </button>
            </div>
          </div>

          {selectedOrder?.orderNumber === order.orderNumber && (
            <div className={styles.orderDetails}>
              <div className={styles.itemList}>
                <h4>样品清单</h4>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      <img
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <h5>{item.name}</h5>
                      <p className={styles.itemModel}>编号: {item.model}</p>
                      <div className={styles.specs}>
                        {Object.entries(item.specs || {}).map(([key, value]) => (
                          <span key={key} className={styles.spec}>
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.itemQuantity}>
                      数量: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.contactInfo}>
                <h4>联系信息</h4>
                <p><strong>姓名：</strong>{order.contactInfo.name}</p>
                <p><strong>邮箱：</strong>{order.contactInfo.email}</p>
                <p><strong>电话：</strong>{order.contactInfo.phone}</p>
                {order.contactInfo.company && (
                  <p><strong>公司：</strong>{order.contactInfo.company}</p>
                )}
                {order.contactInfo.notes && (
                  <p><strong>备注：</strong>{order.contactInfo.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 