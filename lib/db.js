// 使用内存存储
let orders = [];

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

export async function updateOrderStatus(orderNumber, updatedOrder) {
  try {
    const index = orders.findIndex(order => order.orderNumber === orderNumber)
    if (index === -1) {
      throw new Error('订单不存在')
    }
    orders[index] = updatedOrder
    return updatedOrder
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
} 