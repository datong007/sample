import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] }))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const orderData = req.body

    // 验证订单数据
    if (!orderData.items || !orderData.contactInfo) {
      return res.status(400).json({ 
        success: false, 
        message: '订单数据不完整' 
      })
    }

    // 读取现有订单
    const data = fs.readFileSync(ORDERS_FILE, 'utf8')
    const { orders } = JSON.parse(data)

    // 生成订单号（如果没有）
    if (!orderData.orderNumber) {
      orderData.orderNumber = `SO${Date.now()}`
    }

    // 添加订单状态和时间戳
    const newOrder = {
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 添加新订单
    orders.push(newOrder)

    // 保存到文件
    fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders }, null, 2))

    res.status(200).json({ 
      success: true,
      orderNumber: newOrder.orderNumber
    })
  } catch (error) {
    console.error('保存订单失败:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || '保存订单失败'
    })
  }
} 