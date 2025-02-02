import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 初始化空的订单文件
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // 读取订单数据
    let orders = []
    try {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8')
      const parsedData = JSON.parse(data)
      orders = parsedData.orders || []
    } catch (parseError) {
      console.error('解析订单文件失败，重置文件:', parseError)
      // 如果文件损坏，重新创建
      fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] }, null, 2))
    }

    // 确保每个订单都有必要的字段
    orders = orders.map(order => ({
      id: order.id || `order_${Date.now()}`,
      orderNumber: order.orderNumber,
      items: order.items || [],
      contactInfo: order.contactInfo || {},
      status: order.status || 'pending',
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.updatedAt || new Date().toISOString()
    }))

    // 按创建时间降序排序
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )

    res.status(200).json({ 
      success: true,
      orders: sortedOrders 
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.status(500).json({ 
      success: false,
      message: '获取订单列表失败' 
    })
  }
} 