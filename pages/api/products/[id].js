import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')

// 读取产品数据
const readProducts = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return []
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取产品数据失败:', error)
    return []
  }
}

// 保存产品数据
const saveProducts = (products) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2))
    return true
  } catch (error) {
    console.error('保存产品数据失败:', error)
    return false
  }
}

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      try {
        const products = readProducts()
        const product = products.find(p => p.id === id)
        
        if (!product) {
          return res.status(404).json({ message: '产品不存在' })
        }

        res.status(200).json({ success: true, product })
      } catch (error) {
        res.status(500).json({ message: '获取产品信息失败' })
      }
      break

    case 'PUT':
      try {
        const products = readProducts()
        const index = products.findIndex(p => p.id === id)
        
        if (index === -1) {
          return res.status(404).json({ message: '产品不存在' })
        }

        const updatedProduct = {
          ...products[index],
          ...req.body,
          updatedAt: new Date().toISOString()
        }

        products[index] = updatedProduct

        if (!saveProducts(products)) {
          throw new Error('保存失败')
        }

        res.status(200).json({ success: true, product: updatedProduct })
      } catch (error) {
        res.status(500).json({ message: '更新产品失败' })
      }
      break

    case 'DELETE':
      try {
        const products = readProducts()
        const filteredProducts = products.filter(p => p.id !== id)
        
        if (products.length === filteredProducts.length) {
          return res.status(404).json({ message: '产品不存在' })
        }

        if (!saveProducts(filteredProducts)) {
          throw new Error('删除失败')
        }

        res.status(200).json({ success: true })
      } catch (error) {
        res.status(500).json({ message: '删除产品失败' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
} 