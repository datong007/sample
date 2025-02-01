// 使用内存缓存
let stockCache = {}

export async function getCurrentStock(productId) {
  try {
    const res = await fetch('/api/stock')
    const data = await res.json()
    return data.stock[productId] || 0
  } catch (error) {
    console.error('获取库存失败:', error)
    return 0
  }
}

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
    
    stockCache[productId] = stock
    return true
  } catch (error) {
    console.error('更新库存失败:', error)
    return false
  }
}

// 订单相关函数
export async function addOrder(orderData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!res.ok) {
      throw new Error('添加订单失败')
    }

    return await res.json()
  } catch (error) {
    console.error('添加订单失败:', error)
    throw error
  }
}

export async function getOrders() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/orders/list`)
    
    if (!res.ok) {
      throw new Error('获取订单列表失败')
    }
    
    const data = await res.json()
    return data.orders || []
  } catch (error) {
    console.error('获取订单列表失败:', error)
    throw error
  }
}

export async function getOrderByNumber(orderNumber) {
  try {
    const res = await fetch(`/api/orders/${orderNumber}`)
    const data = await res.json()
    return data.order
  } catch (error) {
    console.error('获取订单失败:', error)
    return null
  }
}

export async function updateOrderStatus(orderNumber, updatedOrder) {
  try {
    const res = await fetch(`/api/orders/${orderNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder),
    })
    
    if (!res.ok) {
      throw new Error('更新订单状态失败')
    }
    
    const data = await res.json()
    return data.order
  } catch (error) {
    console.error('更新订单状态失败:', error)
    throw error
  }
}

// 添加删除订单功能
export async function deleteOrder(orderNumber) {
  try {
    const res = await fetch(`/api/orders/${orderNumber}`, {
      method: 'DELETE',
    })
    
    if (!res.ok) {
      throw new Error('删除订单失败')
    }
    
    return { success: true }
  } catch (error) {
    console.error('删除订单失败:', error)
    throw error
  }
}

// 添加批量删除功能
export async function deleteOrders(orderNumbers) {
  try {
    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNumbers }),
    })
    
    if (!res.ok) {
      throw new Error('批量删除订单失败')
    }
    
    return { success: true }
  } catch (error) {
    console.error('批量删除订单失败:', error)
    throw error
  }
} 