import { useState, useEffect } from 'react';
import { getOrders } from '../lib/db';
import styles from '../styles/AdminOrderList.module.css';
import { ORDER_STATUS, STATUS_MAP } from '../constants/orderStatus';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // 获取订单列表
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/list');
      if (!response.ok) {
        throw new Error('获取订单列表失败');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('获取订单失败:', error);
      setError('获取订单列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 更新订单状态
  const updateOrderStatus = async (orderNumber, newStatus) => {
    try {
      setUpdatingStatus(orderNumber);
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新订单状态失败');
      }

      // 更新本地状态
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新订单状态失败，请重试');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 判断订单是否可以编辑状态
  const canEditStatus = (order) => {
    return order.status !== ORDER_STATUS.CANCELLED;
  };

  // 获取可用的状态选项
  const getAvailableStatuses = (currentStatus) => {
    if (currentStatus === ORDER_STATUS.CANCELLED) {
      return [ORDER_STATUS.CANCELLED];
    }
    return [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.COMPLETED
    ];
  };

  // 渲染状态选择器
  const renderStatusSelector = (order) => {
    const isUpdating = updatingStatus === order.orderNumber;
    const currentStatus = order.status || ORDER_STATUS.PENDING;
    const availableStatuses = getAvailableStatuses(currentStatus);

    if (!canEditStatus(order)) {
      return (
        <div className={`${styles.status} ${styles[currentStatus]}`}>
          {STATUS_MAP[currentStatus].text}
        </div>
      );
    }

    return (
      <select
        className={`${styles.statusSelect} ${styles[currentStatus]}`}
        value={currentStatus}
        onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
        disabled={isUpdating}
      >
        {availableStatuses.map((status) => (
          <option key={status} value={status}>
            {STATUS_MAP[status].text}
          </option>
        ))}
      </select>
    );
  };

  // 添加计算总数量的辅助函数
  const calculateTotalQuantity = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // 修改 handleExportPDF 函数
  const handleExportPDF = async (order) => {
    try {
      const doc = new jsPDF();
      
      // 设置标题
      doc.setFontSize(16);
      doc.text('样品订单详情', 105, 20, { align: 'center' });

      // 基本信息
      doc.autoTable({
        startY: 30,
        head: [['订单基本信息', '']],
        body: [
          ['订单号', order.orderNumber],
          ['提交时间', new Date(order.createdAt).toLocaleString()],
          ['订单状态', STATUS_MAP[order.status].text],
          ['样品总数', `${calculateTotalQuantity(order.items)} 件`],
        ],
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      // 联系人信息
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['联系人信息', '']],
        body: [
          ['联系人', order.contactInfo.name],
          ['电话', order.contactInfo.phone],
          ['邮箱', order.contactInfo.email],
          ...(order.contactInfo.company ? [['公司', order.contactInfo.company]] : []),
          ...(order.contactInfo.notes ? [['备注', order.contactInfo.notes]] : []),
        ],
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
      });

      // 样品清单
      let startY = doc.lastAutoTable.finalY + 10;
      doc.text('样品清单', 20, startY);
      startY += 10;

      // 为每个样品创建独立的表格
      for (const item of order.items) {
        // 添加图片
        try {
          const imgData = await getImageDataUrl(item.image || '/images/placeholder.jpg');
          doc.addImage(imgData, 'JPEG', 20, startY, 30, 30);
        } catch (error) {
          console.error('加载图片失败:', error);
        }

        // 样品信息表格
        doc.autoTable({
          startY: startY,
          margin: { left: 55 },
          head: [],
          body: [
            ['名称', item.name],
            ['型号', item.model],
            ['规格', Object.entries(item.specs || {})
              .filter(([_, value]) => value)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')],
            ['数量', item.quantity.toString()],
          ],
          theme: 'grid',
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 85 },
          },
        });

        startY = doc.lastAutoTable.finalY + 10;

        // 检查是否需要新页
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }
      }

      // 添加页脚
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `打印时间：${new Date().toLocaleString()} - 第 ${i} 页，共 ${pageCount} 页`,
          20,
          287
        );
      }

      // 保存 PDF
      doc.save(`订单_${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('生成PDF失败:', error);
      alert('生成PDF失败，请重试');
    }
  };

  // 添加图片转换工具函数
  const getImageDataUrl = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // 修改打印功能
  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>订单详情 - ${order.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #eee;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .section h3 {
              margin: 0 0 15px 0;
              color: #1e293b;
            }
            .item {
              display: flex;
              gap: 20px;
              padding: 15px;
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              margin-bottom: 15px;
            }
            .item-image {
              width: 120px;
              height: 120px;
              object-fit: cover;
              border-radius: 4px;
            }
            .item-details {
              flex: 1;
            }
            .specs {
              color: #64748b;
              font-size: 0.9em;
              margin: 10px 0;
            }
            .quantity {
              font-weight: bold;
              color: #1e293b;
            }
            @media print {
              body { padding: 0; }
              .section { break-inside: avoid; }
              button { display: none; }
              @page {
                size: A4;
                margin: 2cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>样品订单详情</h2>
            <p>订单号：${order.orderNumber}</p>
          </div>
          <div class="section">
            <h3>基本信息</h3>
            <p>提交时间：${new Date(order.createdAt).toLocaleString()}</p>
            <p>订单状态：${STATUS_MAP[order.status].text}</p>
            <p>样品总数：${calculateTotalQuantity(order.items)} 件</p>
          </div>
          <div class="section">
            <h3>联系人信息</h3>
            <p>联系人：${order.contactInfo.name}</p>
            <p>电话：${order.contactInfo.phone}</p>
            <p>邮箱：${order.contactInfo.email}</p>
            ${order.contactInfo.company ? `<p>公司：${order.contactInfo.company}</p>` : ''}
            ${order.contactInfo.notes ? `<p>备注：${order.contactInfo.notes}</p>` : ''}
          </div>
          <div class="section">
            <h3>样品清单</h3>
            ${order.items.map(item => `
              <div class="item">
                <img 
                  class="item-image"
                  src="${item.image || '/images/placeholder.jpg'}"
                  alt="${item.name}"
                  onerror="this.src='/images/placeholder.jpg'"
                />
                <div class="item-details">
                  <h4>${item.name}</h4>
                  <p>型号：${item.model}</p>
                  <p class="specs">
                    ${Object.entries(item.specs || {})
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('<br>')}
                  </p>
                  <p class="quantity">数量：${item.quantity}</p>
                </div>
              </div>
            `).join('')}
          </div>
          <button onclick="window.print()">打印</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={styles.adminOrderList}>
      <h2>订单管理</h2>
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : error ? (
        <div className={styles.error}>
          {error}
          <button onClick={fetchOrders} className={styles.retryButton}>
            重试
          </button>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.orderNumber} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3>订单号: {order.orderNumber}</h3>
                  <p className={styles.orderDate}>
                    提交时间: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className={styles.totalItems}>
                    样品总数: {calculateTotalQuantity(order.items)} 件
                  </p>
                </div>
                <div className={styles.headerButtons}>
                  {renderStatusSelector(order)}
                  <button
                    className={styles.detailsButton}
                    onClick={() => setExpandedOrder(
                      expandedOrder === order.orderNumber ? null : order.orderNumber
                    )}
                  >
                    {expandedOrder === order.orderNumber ? '收起详情' : '查看详情'}
                  </button>
                  <button
                    className={styles.exportButton}
                    onClick={() => handleExportPDF(order)}
                  >
                    导出 PDF
                  </button>
                  <button
                    className={styles.printButton}
                    onClick={() => handlePrint(order)}
                  >
                    打印订单
                  </button>
                </div>
              </div>

              {expandedOrder === order.orderNumber && (
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
                            <img 
                              src={item.image || '/images/placeholder.jpg'} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder.jpg';
                              }}
                            />
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
                            <div className={styles.itemQuantity}>
                              数量：{item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 