// 用于临时存储产品数据
let products = []

export function addProduct(product) {
  const newProduct = {
    id: Date.now(), // 使用时间戳作为临时ID
    ...product,
    createdAt: new Date().toISOString()
  }
  products.push(newProduct)
  return newProduct
}

export function getProducts() {
  return products
} 