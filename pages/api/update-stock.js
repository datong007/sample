import { updateProductStock } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { items } = req.body;
    const updates = [];

    // 批量更新库存
    for (const item of items) {
      const result = await updateProductStock(item.id, -item.quantity);
      updates.push({
        productId: item.id,
        newStock: result.newStock
      });
    }

    res.status(200).json({ 
      success: true, 
      message: '库存更新成功',
      updates 
    });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || '更新库存失败' 
    });
  }
} 