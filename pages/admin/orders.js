import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../styles/AdminOrders.module.css'
import { ORDER_STATUS, STATUS_MAP } from '../../constants/orderStatus'
import { jsPDF } from 'jspdf'
import AdminOrderList from '../../components/AdminOrderList'

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
  return (
    <AdminLayout>
      <AdminOrderList />
    </AdminLayout>
  )
} 