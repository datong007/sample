// 使用内存存储
let orders = [];
let stocks = new Map();

export async function addOrder(orderData) {
  try {
    // 验证订单数据
    if (!orderData.orderNumber || !orderData.items || !orderData.contactInfo) {
      throw new Error('订单数据不完整');
    }
    
    // 添加创建时间
    const orderToSave = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 保存订单
    orders.push(orderToSave);
    
    return { 
      success: true,
      orderNumber: orderData.orderNumber
    };
  } catch (error) {
    console.error('Error adding order:', error);
    throw new Error(`保存订单失败: ${error.message}`);
  }
}

export async function getOrders() {
  try {
    return orders.sort((a, b) => 
      new Date(b.orderDate) - new Date(a.orderDate)
    );
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function getOrderByNumber(orderNumber) {
  try {
    return orders.find(order => order.orderNumber === orderNumber);
  } catch (error) {
    console.error('Error getting order by number:', error);
    throw error;
  }
}

// 初始化或更新产品库存
export function initializeStock(products) {
  products.forEach(product => {
    stocks.set(product.id, product.stock);
    console.log(`初始化产品 ${product.id} 库存为: ${product.stock}`);
  });
}

// 获取当前库存
export async function getCurrentStock(productId) {
  return stocks.get(productId) || 0;
}

// 更新库存
export async function updateProductStock(productId, quantity) {
  try {
    const currentStock = stocks.get(productId) || 0;
    console.log(`更新前库存: ${currentStock}, 更新数量: ${quantity}`);
    
    const newStock = currentStock + quantity;
    if (newStock < 0) {
      throw new Error('库存不足');
    }
    
    stocks.set(productId, newStock);
    console.log(`更新后库存: ${newStock}`);
    return { success: true, newStock };
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
} 