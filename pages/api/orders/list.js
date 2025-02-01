import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // 确保文件存在
    if (!fs.existsSync(ORDERS_FILE)) {
      return res.status(200).json({ orders: [] })
    }

    // 读取订单数据
    const data = fs.readFileSync(ORDERS_FILE, 'utf8')
    const { orders } = JSON.parse(data)

    // 按提交时间降序排序
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