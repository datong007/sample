import { useEffect, useState } from 'react';
import styles from '../styles/Orders.module.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('获取订单失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>订单列表</h1>
      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.orderNumber} className={styles.orderItem}>
            <h3>订单号: {order.orderNumber}</h3>
            <p>提交时间: {new Date(order.orderDate).toLocaleString()}</p>
            <p>样品数量: {order.totalItems}</p>
            <div className={styles.itemList}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <span>{item.name}</span>
                  <span>数量: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 