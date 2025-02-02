import fs from 'fs'
import path from 'path'
import { getOrderByNumber } from '../../../lib/db'
import { ORDER_STATUS } from '../../../constants/orderStatus'

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8')
        const { orders } = JSON.parse(data)
        const order = orders.find(o => o.orderNumber === id)
        
        if (!order) {
          return res.status(404).json({ message: '订单不存在' })
        }
        
        res.status(200).json({ success: true, order })
      } catch (error) {
        res.status(500).json({ message: '获取订单信息失败' })
      }
      break

    case 'PUT':
      try {
        const { status } = req.body
        const data = fs.readFileSync(ORDERS_FILE, 'utf8')
        const { orders } = JSON.parse(data)
        
        const orderIndex = orders.findIndex(o => o.orderNumber === id)
        if (orderIndex === -1) {
          return res.status(404).json({ message: '订单不存在' })
        }

        // 更新订单状态
        orders[orderIndex] = {
          ...orders[orderIndex],
          status,
          updatedAt: new Date().toISOString()
        }

        // 保存更新
        fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders }, null, 2))
        
        res.status(200).json({ 
          success: true, 
          order: orders[orderIndex]
        })
      } catch (error) {
        console.error('更新订单状态失败:', error)
        res.status(500).json({ message: '更新订单状态失败' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
} 