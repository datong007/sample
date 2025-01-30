import { updateProductStock } from '../../lib/db' // 假设这是你的数据库操作函数

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    // 批量更新库存
    for (const item of items) {
      await updateProductStock(item.id, -item.quantity); // 减少库存
    }

    res.status(200).json({ success: true, message: '库存更新成功' });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({ success: false, message: '更新库存失败' });
  }
}

// 模拟数据库更新函数
async function updateProductStock(productId, quantity) {
  // 这里应该是实际的数据库更新操作
  console.log(`更新产品 ${productId} 的库存，减少 ${quantity} 件`);
} 