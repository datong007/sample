export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 这里应该是从数据库获取实际库存的逻辑
    const stocks = await getCurrentStocks();
    res.status(200).json({ success: true, stocks });
  } catch (error) {
    console.error('获取库存失败:', error);
    res.status(500).json({ success: false, message: '获取库存失败' });
  }
}

// 模拟从数据库获取库存的函数
async function getCurrentStocks() {
  // 这里应该是实际的数据库查询
  return {
    1: 10,
    2: 5,
    3: 8
  };
} 