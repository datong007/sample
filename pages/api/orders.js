import { addOrder } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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
} 