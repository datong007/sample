import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function generateOrderPDF(orderData) {
  // 创建 PDF 实例
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // 使用默认字体
  doc.setFont('helvetica')
  
  // 添加标题
  doc.setFontSize(20)
  doc.text('样品申请单 / Sample Request Form', 105, 20, { align: 'center' })
  
  // 添加订单信息
  doc.setFontSize(12)
  doc.text(`订单号 / Order No.：${orderData.orderNumber}`, 20, 40)
  doc.text(`日期 / Date：${new Date(orderData.orderDate).toLocaleDateString()}`, 20, 50)
  
  // 添加联系人信息
  doc.text('联系人信息 / Contact Information', 20, 70)
  doc.text(`姓名 / Name：${orderData.contactInfo.name}`, 20, 80)
  doc.text(`邮箱 / Email：${orderData.contactInfo.email}`, 20, 90)
  doc.text(`电话 / Phone：${orderData.contactInfo.phone}`, 20, 100)
  if (orderData.contactInfo.company) {
    doc.text(`公司 / Company：${orderData.contactInfo.company}`, 20, 110)
  }
  
  // 添加产品表格
  const tableColumn = [
    ['产品名称 / Product Name'],
    ['型号 / Model'],
    ['规格 / Specifications'],
    ['数量 / Quantity']
  ].map(pair => pair.join('\n'))

  const tableRows = orderData.items.map(item => [
    item.name,
    item.model,
    Object.entries(item.specs || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n'),
    item.quantity.toString()
  ])
  
  doc.autoTable({
    startY: orderData.contactInfo.company ? 120 : 110,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { 
      fontSize: 10,
      cellPadding: 5
    },
    headStyles: { 
      fillColor: [159, 122, 234],
      textColor: [255, 255, 255],
      fontSize: 10
    },
    columnStyles: {
      2: { cellWidth: 'auto' }
    }
  })
  
  // 添加备注
  if (orderData.contactInfo.notes) {
    const finalY = doc.lastAutoTable.finalY || 120
    doc.text('备注 / Notes：', 20, finalY + 20)
    doc.text(orderData.contactInfo.notes, 20, finalY + 30)
  }
  
  return doc
}

// 添加一个通用的下载函数
export function downloadPDF(doc, filename) {
  doc.save(filename)
} 