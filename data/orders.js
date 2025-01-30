let orders = []

export function addOrder(order) {
  orders.push(order)
  return order
}

export function getOrders() {
  return orders
}

export function getOrderByNumber(orderNumber) {
  return orders.find(order => order.orderNumber === orderNumber)
} 