import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../styles/AdminOrders.module.css'
import { ORDER_STATUS, STATUS_MAP } from '../../constants/orderStatus'
import { jsPDF } from 'jspdf'

// 添加这个函数在组件外部
const generatePDF = async (order) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true // 启用压缩
    })

    doc.setFont('helvetica')
    
    // 创建图片加载函数
    const loadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const maxSize = 400 // 减小最大尺寸以优化文件大小
            let width = img.width
            let height = img.height
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height / width) * maxSize
                width = maxSize
              } else {
                width = (width / height) * maxSize
                height = maxSize
              }
            }
            
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', 0.6)) // 降低图片质量以减小文件大小
          } catch (err) {
            resolve('/images/no-image.png')
          }
        }
        img.onerror = () => resolve('/images/no-image.png')
        const fullUrl = url?.startsWith('/') ? `${window.location.origin}${url}` : url
        img.src = fullUrl || '/images/no-image.png'
      })
    }

    const images = await Promise.all(order.items.map(item => loadImage(item.image)))

    // 紧凑布局的内容
    const startY = 15
    const lineHeight = 7
    let currentY = startY

    doc.setFontSize(14)
    doc.text('样品订单详情', 15, currentY)
    currentY += lineHeight * 1.5

    doc.setFontSize(10)
    doc.text(`订单号：${order.orderNumber}`, 15, currentY)
    currentY += lineHeight
    doc.text(`提交时间：${new Date(order.orderDate).toLocaleString()}`, 15, currentY)
    currentY += lineHeight
    doc.text(`状态：${STATUS_MAP[order.status]?.text || '待处理'}`, 15, currentY)
    currentY += lineHeight
    doc.text(`样品总数：${order.items.reduce((sum, item) => sum + item.quantity, 0)} 件`, 15, currentY)
    currentY += lineHeight * 1.2

    doc.text('联系人信息', 15, currentY)
    currentY += lineHeight
    doc.text(`联系人：${order.contactInfo.name}`, 20, currentY)
    currentY += lineHeight
    doc.text(`电话：${order.contactInfo.phone}`, 20, currentY)
    currentY += lineHeight
    doc.text(`邮箱：${order.contactInfo.email}`, 20, currentY)
    currentY += lineHeight

    if (order.contactInfo.company) {
      doc.text(`公司：${order.contactInfo.company}`, 20, currentY)
      currentY += lineHeight
    }
    if (order.contactInfo.notes) {
      doc.text(`备注：${order.contactInfo.notes}`, 20, currentY)
      currentY += lineHeight
    }

    currentY += lineHeight * 0.5
    doc.text('样品清单', 15, currentY)
    currentY += lineHeight

    // 优化表格配置
    await import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        startY: currentY,
        head: [['图片', '产品名称', '型号', '数量', '规格信息']],
        body: order.items.map((item, index) => [
          {
            content: images[index],
            width: 15,
            height: 15
          },
          item.name,
          item.model,
          item.quantity.toString(),
          Object.entries(item.specs || {})
            .filter(([_, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 1,
          lineWidth: 0.1,
          minCellHeight: 6
        },
        headStyles: {
          fillColor: [159, 122, 234],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          minCellHeight: 4
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center', valign: 'middle' },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 'auto' }
        },
        didDrawCell: (data) => {
          try {
            if (data.section === 'body' && data.column.index === 0 && data.cell.raw?.content) {
              const dim = Math.min(data.cell.height - 1, 15)
              doc.addImage(
                data.cell.raw.content,
                'JPEG',
                data.cell.x + 0.5,
                data.cell.y + 0.5,
                dim,
                dim
              )
            }
          } catch (err) {
            console.error('单元格渲染失败:', err)
          }
        }
      })
    })

    return doc
  } catch (error) {
    console.error('PDF生成失败:', error)
    throw new Error('PDF生成失败，请重试')
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

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

  const handleDownloadPDF = async (order) => {
    try {
      const doc = await generatePDF(order)
      doc.save(`order-${order.orderNumber}.pdf`)
    } catch (error) {
      console.error('生成PDF失败:', error)
      alert('生成PDF失败，请重试')
    }
  }

  // 打印订单
  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('请允许弹出窗口以打印订单')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>订单 ${order.orderNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              font-size: 10.5pt;
              line-height: 1.4;
            }

            .container {
              max-width: 180mm;
              margin: 0 auto;
            }

            h1 {
              font-size: 16pt;
              margin: 0 0 10mm;
              text-align: center;
            }

            h2 {
              font-size: 12pt;
              margin: 5mm 0 3mm;
            }

            p {
              margin: 1mm 0;
            }

            .info-section {
              margin-bottom: 5mm;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 3mm 0;
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
            }

            th, td {
              border: 0.5pt solid #000;
              padding: 2mm;
              text-align: left;
              font-size: 9pt;
            }

            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }

            .product-image {
              width: 20mm;
              height: 20mm;
              object-fit: cover;
            }

            .image-cell {
              width: 25mm;
              text-align: center;
              vertical-align: middle;
            }

            .specs {
              white-space: pre-line;
            }

            @media print {
              body {
                width: auto;
                height: auto;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              thead {
                display: table-header-group;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>样品订单详情</h1>
            
            <div class="info-section">
              <p><strong>订单号：</strong>${order.orderNumber}</p>
              <p><strong>提交时间：</strong>${new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>状态：</strong>${STATUS_MAP[order.status]?.text || '待处理'}</p>
              <p><strong>样品总数：</strong>${order.items.reduce((sum, item) => sum + item.quantity, 0)} 件</p>
            </div>
            
            <div class="info-section">
              <h2>联系人信息</h2>
              <p><strong>联系人：</strong>${order.contactInfo.name}</p>
              <p><strong>电话：</strong>${order.contactInfo.phone}</p>
              <p><strong>邮箱：</strong>${order.contactInfo.email}</p>
              ${order.contactInfo.company ? `<p><strong>公司：</strong>${order.contactInfo.company}</p>` : ''}
              ${order.contactInfo.notes ? `<p><strong>备注：</strong>${order.contactInfo.notes}</p>` : ''}
            </div>
            
            <h2>样品清单</h2>
            <table>
              <thead>
                <tr>
                  <th>图片</th>
                  <th>产品名称</th>
                  <th>型号</th>
                  <th>数量</th>
                  <th>规格信息</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td class="image-cell">
                      <img 
                        src="${item.image || '/images/no-image.png'}" 
                        alt="${item.name}"
                        class="product-image"
                        onerror="this.src='/images/no-image.png'"
                      />
                    </td>
                    <td>${item.name}</td>
                    <td>${item.model}</td>
                    <td>${item.quantity}</td>
                    <td class="specs">${Object.entries(item.specs || {})
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('\n')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // 等待图片加载完成后再打印
    printWindow.onload = () => {
      const images = printWindow.document.getElementsByTagName('img')
      let loadedImages = 0
      
      function tryPrint() {
        loadedImages++
        if (loadedImages === images.length) {
          printWindow.print()
        }
      }

      if (images.length === 0) {
        printWindow.print()
      } else {
        Array.from(images).forEach(img => {
          if (img.complete) {
            tryPrint()
          } else {
            img.onload = tryPrint
            img.onerror = tryPrint
          }
        })
      }
    }
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <Head>
          <title>订单管理</title>
          <meta name="description" content="管理订单" />
        </Head>

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
                    <p className={styles.totalItems}>
                      样品总数：{order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
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
                  <div className={styles.orderActions}>
                    <button
                      onClick={() => handleDownloadPDF(order)}
                      className={styles.actionButton}
                    >
                      下载PDF
                    </button>
                    <button
                      onClick={() => handlePrint(order)}
                      className={styles.actionButton}
                    >
                      打印订单
                    </button>
                  </div>
                </div>

                <div className={styles.contactInfo}>
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

                <button
                  className={styles.toggleDetails}
                  onClick={() => setExpandedOrder(
                    expandedOrder === order.orderNumber ? null : order.orderNumber
                  )}
                >
                  {expandedOrder === order.orderNumber ? '收起详情' : '查看详情'}
                </button>

                {expandedOrder === order.orderNumber && (
                  <div className={styles.orderDetails}>
                    <h4>样品清单</h4>
                    <div className={styles.itemList}>
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 