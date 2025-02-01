import { getOrderByNumber, updateOrderStatus } from '../../../lib/db'

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
        if (!status) {
          return res.status(400).json({ message: '缺少状态信息' })
        }

        const order = await getOrderByNumber(id)
        if (!order) {
          return res.status(404).json({ message: '订单不存在' })
        }

        // 更新订单状态
        const updatedOrder = {
          ...order,
          status,
          updatedAt: new Date().toISOString()
        }

        // 保存更新后的订单
        await updateOrderStatus(id, updatedOrder)

        res.status(200).json({ success: true, order: updatedOrder })
      } catch (error) {
        res.status(500).json({ message: '更新订单状态失败' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
} 