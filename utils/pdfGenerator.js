import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

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
  doc.text('Sample Request Form / 样品申请单', 105, 20, { align: 'center' })
  
  // 添加订单信息
  doc.setFontSize(12)
  doc.text(`Order No. / 订单号：${orderData.orderNumber}`, 20, 40)
  doc.text(`Date / 日期：${new Date(orderData.orderDate).toLocaleDateString()}`, 20, 50)
  
  // 添加联系人信息
  doc.text('Contact Information / 联系人信息', 20, 70)
  doc.text(`Name / 姓名：${orderData.contactInfo.name}`, 20, 80)
  doc.text(`Email / 邮箱：${orderData.contactInfo.email}`, 20, 90)
  doc.text(`Phone / 电话：${orderData.contactInfo.phone}`, 20, 100)
  
  // 添加产品表格
  const tableColumn = [
    ['Product Name', '产品名称'],
    ['Model', '型号'],
    ['Quantity', '数量']
  ].map(pair => pair.join('\n'))

  const tableRows = orderData.items.map(item => [
    item.name,
    item.model,
    item.quantity.toString()
  ])
  
  doc.autoTable({
    startY: 120,
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
    }
  })
  
  // 添加备注
  if (orderData.contactInfo.notes) {
    const finalY = doc.lastAutoTable.finalY || 120
    doc.text('Notes / 备注：', 20, finalY + 20)
    doc.text(orderData.contactInfo.notes, 20, finalY + 30)
  }
  
  return doc
} 