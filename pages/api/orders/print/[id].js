import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { getOrderByNumber } from '../../../../lib/db';
import { ORDER_STATUS, STATUS_MAP } from '../../../../constants/orderStatus';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const order = await getOrderByNumber(id);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 创建 PDF 文档
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 加载中文字体
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'SourceHanSansCN-Normal.ttf');
    const fontBuffer = fs.readFileSync(fontPath);
    doc.addFileToVFS('SourceHanSansCN-Normal.ttf', fontBuffer.toString('base64'));
    doc.addFont('SourceHanSansCN-Normal.ttf', 'SourceHanSansCN', 'normal');
    doc.setFont('SourceHanSansCN');

    // 标题
    doc.setFontSize(16);
    doc.text('样品订单详情', 105, 20, { align: 'center' });

    // 基本信息
    doc.autoTable({
      startY: 30,
      head: [['订单基本信息', '']],
      body: [
        ['订单号', order.orderNumber],
        ['提交时间', new Date(order.createdAt).toLocaleString('zh-CN')],
        ['订单状态', STATUS_MAP[order.status].text],
        ['样品总数', `${order.items.reduce((sum, item) => sum + item.quantity, 0)} 件`],
      ],
      theme: 'grid',
      styles: {
        font: 'SourceHanSansCN',
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 20, right: 20 },
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
      styles: {
        font: 'SourceHanSansCN',
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 20, right: 20 },
    });

    // 样品清单
    const itemsTableBody = order.items.map(item => [
      item.name,
      item.model,
      item.specs ? Object.entries(item.specs)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n') : '',
      item.quantity.toString()
    ]);

    // 样品清单表格
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['样品名称', '型号', '规格', '数量']],
      body: itemsTableBody,
      theme: 'grid',
      styles: {
        font: 'SourceHanSansCN',
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 80 },
        3: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
    });

    // 添加页脚
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('SourceHanSansCN');
      doc.text(
        `打印时间：${new Date().toLocaleString('zh-CN')} - 第 ${i} 页，共 ${pageCount} 页`,
        20,
        287
      );
    }

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `inline; filename=order_${order.orderNumber}.pdf`
    );

    // 发送 PDF
    const buffer = Buffer.from(doc.output('arraybuffer'));
    res.send(buffer);

  } catch (error) {
    console.error('生成订单PDF失败:', error);
    console.error(error.stack); // 添加详细错误信息
    res.status(500).json({ 
      message: '生成订单PDF失败',
      error: error.message,
      stack: error.stack
    });
  }
} 