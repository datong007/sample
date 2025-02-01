import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { productId, stock } = req.body
    if (!productId || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: '无效的请求数据' })
    }

    // 读取现有产品数据
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

    // 更新库存
    const updatedProducts = productsData.products.map(product =>
      product.id === productId
        ? { ...product, stock }
        : product
    )

    // 保存更新后的数据
    fs.writeFileSync(productsPath, JSON.stringify({ products: updatedProducts }, null, 2))

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('更新库存失败:', error)
    res.status(500).json({ message: '更新库存失败' })
  }
} 