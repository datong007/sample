import { addOrder, getOrders } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const result = await addOrder(req.body)
      res.status(200).json({ 
        success: true,
        orderNumber: result.orderNumber
      })
    } catch (error) {
      console.error('保存订单失败:', error)
      res.status(500).json({ 
        success: false, 
        message: error.message || '保存订单失败'
      })
    }
  } else if (req.method === 'GET') {
    try {
      // 从数据库获取订单列表
      const orders = await getOrders()
      
      // 为每个订单添加默认状态（如果没有）
      const ordersWithStatus = orders.map(order => ({
        ...order,
        status: order.status || 'pending'  // 默认状态为"待处理"
      }))

      // 按提交时间降序排序
      ordersWithStatus.sort((a, b) => 
        new Date(b.orderDate) - new Date(a.orderDate)
      )

      res.status(200).json({ 
        success: true, 
        orders: ordersWithStatus 
      })
    } catch (error) {
      console.error('获取订单列表失败:', error)
      res.status(500).json({ 
        success: false, 
        message: error.message || '获取订单列表失败'
      })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
} 