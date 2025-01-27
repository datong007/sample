// 模拟数据库存储
let orders = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      
      // 添加到订单列表
      orders.push(orderData);
      
      // 返回成功响应
      res.status(200).json({ 
        success: true, 
        message: '订单已接收',
        orderNumber: orderData.orderNumber 
      });
      
    } catch (error) {
      console.error('处理订单失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '处理订单时出错' 
      });
    }
  } else if (req.method === 'GET') {
    // 获取所有订单（仅供测试使用）
    res.status(200).json(orders);
  } else {
    res.status(405).json({ message: '不支持的请求方法' });
  }
} 