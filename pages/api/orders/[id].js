import fs from 'fs'
import path from 'path'
import { getOrderByNumber } from '../../../lib/db'
import { ORDER_STATUS } from '../../../constants/orderStatus'

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      try {
        const order = await getOrderByNumber(id)
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
        
        // 验证状态值是否有效
        if (!Object.values(ORDER_STATUS).includes(status)) {
          return res.status(400).json({ message: '无效的订单状态' })
        }

        // 读取订单数据
        const data = fs.readFileSync(ORDERS_FILE, 'utf8')
        const { orders } = JSON.parse(data)

        // 查找并更新订单
        const orderIndex = orders.findIndex(order => order.orderNumber === id)
        
        if (orderIndex === -1) {
          return res.status(404).json({ message: '订单不存在' })
        }

        // 检查是否是已取消的订单
        if (orders[orderIndex].status === ORDER_STATUS.CANCELLED && !req.cookies.adminToken) {
          return res.status(403).json({ message: '已取消的订单不能修改状态' })
        }

        // 更新订单状态
        orders[orderIndex] = {
          ...orders[orderIndex],
          status,
          updatedAt: new Date().toISOString()
        }

        // 保存更新后的数据
        fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders }, null, 2))

        // 返回更新后的订单
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