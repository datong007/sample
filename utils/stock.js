// 从服务器获取库存信息
export async function getCurrentStock(productId) {
  try {
    const res = await fetch(`/api/stock?productId=${productId}`)
    if (!res.ok) {
      throw new Error('获取库存失败')
    }
    const data = await res.json()
    return data.stock[productId] || 0
  } catch (error) {
    console.error('获取库存失败:', error)
    return 0
  }
}

// 更新库存
export async function updateStock(productId, stock) {
  try {
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, stock }),
    })
    
    if (!res.ok) {
      throw new Error('更新库存失败')
    }
    
    return true
  } catch (error) {
    console.error('更新库存失败:', error)
    return false
  }
}

// 批量获取库存
export async function getAllStocks() {
  try {
    const res = await fetch('/api/stock')
    if (!res.ok) {
      throw new Error('获取库存失败')
    }
    const data = await res.json()
    return data.stock || {}
  } catch (error) {
    console.error('获取库存失败:', error)
    return {}
  }
} 