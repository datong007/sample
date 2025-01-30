import { addOrder, getOrders } from '../../lib/db'
import nodemailer from 'nodemailer'

// 配置邮件发送
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// 发送通知邮件给管理员
async function sendNotificationEmail(orderData) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `新样品申请单 - ${orderData.orderNumber}`,
    html: `
      <h2>新样品申请单</h2>
      <p><strong>订单号：</strong>${orderData.orderNumber}</p>
      <p><strong>提交时间：</strong>${new Date(orderData.orderDate).toLocaleString()}</p>
      <h3>联系人信息</h3>
      <p><strong>姓名：</strong>${orderData.contactInfo.name}</p>
      <p><strong>邮箱：</strong>${orderData.contactInfo.email}</p>
      <p><strong>电话：</strong>${orderData.contactInfo.phone}</p>
      ${orderData.contactInfo.company ? `<p><strong>公司：</strong>${orderData.contactInfo.company}</p>` : ''}
      ${orderData.contactInfo.notes ? `<p><strong>备注：</strong>${orderData.contactInfo.notes}</p>` : ''}
      <h3>样品清单</h3>
      <table border="1" cellpadding="5" style="border-collapse: collapse;">
        <tr>
          <th>产品编号</th>
          <th>产品名称</th>
          <th>规格</th>
          <th>数量</th>
        </tr>
        ${orderData.items.map(item => `
          <tr>
            <td>${item.model}</td>
            <td>${item.name}</td>
            <td>${formatSpecs(item.specs)}</td>
            <td>${item.quantity}</td>
          </tr>
        `).join('')}
      </table>
    `
  }

  await transporter.sendMail(mailOptions)
}

function formatSpecs(specs) {
  if (!specs) return ''
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const orderData = req.body
      
      // 保存订单到数据库
      const savedOrder = await addOrder(orderData)
      
      // 发送通知邮件
      await sendNotificationEmail(orderData)
      
      // 发送确认邮件给客户
      if (orderData.contactInfo.email) {
        const customerMailOptions = {
          from: process.env.SMTP_USER,
          to: orderData.contactInfo.email,
          subject: `样品申请确认 - ${orderData.orderNumber}`,
          html: `
            <h2>样品申请确认</h2>
            <p>尊敬的 ${orderData.contactInfo.name}：</p>
            <p>我们已收到您的样品申请，订单号：${orderData.orderNumber}</p>
            <p>我们会尽快处理您的申请，如有任何问题，请随时联系我们。</p>
            <h3>申请详情</h3>
            <p><strong>订单号：</strong>${orderData.orderNumber}</p>
            <p><strong>提交时间：</strong>${new Date(orderData.orderDate).toLocaleString()}</p>
            <h4>样品清单</h4>
            <table border="1" cellpadding="5" style="border-collapse: collapse;">
              <tr>
                <th>产品编号</th>
                <th>产品名称</th>
                <th>规格</th>
                <th>数量</th>
              </tr>
              ${orderData.items.map(item => `
                <tr>
                  <td>${item.model}</td>
                  <td>${item.name}</td>
                  <td>${formatSpecs(item.specs)}</td>
                  <td>${item.quantity}</td>
                </tr>
              `).join('')}
            </table>
          `
        }
        await transporter.sendMail(customerMailOptions)
      }

      res.status(200).json({ 
        success: true, 
        message: '订单提交成功',
        orderNumber: orderData.orderNumber
      })
    } catch (error) {
      console.error('提交订单失败:', error)
      res.status(500).json({ 
        success: false, 
        message: '提交订单失败' 
      })
    }
  } else if (req.method === 'GET') {
    try {
      const orders = await getOrders()
      res.status(200).json({ success: true, orders })
    } catch (error) {
      console.error('获取订单列表失败:', error)
      res.status(500).json({ success: false, message: '获取订单列表失败' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
} 