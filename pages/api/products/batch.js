import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { productIds } = req.body
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: '无效的请求数据' })
    }

    // 读取现有产品数据
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

    // 过滤掉要删除的产品
    const updatedProducts = productsData.products.filter(
      product => !productIds.includes(product.id)
    )

    // 删除相关的图片文件
    const deletedProducts = productsData.products.filter(
      product => productIds.includes(product.id)
    )
    
    for (const product of deletedProducts) {
      if (product.image) {
        const imagePath = path.join(process.cwd(), 'public', product.image)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }
      // 删除其他图片
      if (product.images) {
        for (const image of product.images) {
          const imagePath = path.join(process.cwd(), 'public', image.url)
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
          }
        }
      }
    }

    // 保存更新后的数据
    fs.writeFileSync(productsPath, JSON.stringify({ products: updatedProducts }, null, 2))

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('批量删除产品失败:', error)
    res.status(500).json({ message: '批量删除失败' })
  }
} 