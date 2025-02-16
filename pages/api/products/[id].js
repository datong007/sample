import fs from 'fs'
import path from 'path'

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json')

// 读取产品数据
const readProducts = () => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return []
    }
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取产品数据失败:', error)
    return []
  }
}

// 保存产品数据
const saveProducts = (products) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    return true
  } catch (error) {
    console.error('保存产品数据失败:', error)
    return false
  }
}

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // 确保文件存在
      if (!fs.existsSync(PRODUCTS_FILE)) {
        return res.status(404).json({ error: '产品数据文件不存在' })
      }

      // 读取产品数据
      const fileContent = fs.readFileSync(PRODUCTS_FILE, 'utf8')
      const products = JSON.parse(fileContent)

      // 查找指定产品
      const product = products.find(p => String(p.id) === String(id))
      
      if (!product) {
        return res.status(404).json({ error: '产品未找到' })
      }

      res.status(200).json(product)
    } catch (error) {
      console.error('获取产品详情失败:', error)
      res.status(500).json({ error: '获取产品详情失败' })
    }
  } else if (req.method === 'PUT') {
    try {
      if (!fs.existsSync(PRODUCTS_FILE)) {
        return res.status(404).json({ error: '产品数据文件不存在' })
      }

      const fileContent = fs.readFileSync(PRODUCTS_FILE, 'utf8')
      const products = JSON.parse(fileContent)

      const productIndex = products.findIndex(p => String(p.id) === String(id))
      
      if (productIndex === -1) {
        return res.status(404).json({ error: '产品未找到' })
      }

      // 更新产品数据
      const updatedProduct = {
        ...products[productIndex],
        ...req.body,
        id // 保持原有id
      }

      products[productIndex] = updatedProduct

      // 保存更新后的数据
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))

      res.status(200).json(updatedProduct)
    } catch (error) {
      console.error('更新产品信息失败:', error)
      res.status(500).json({ error: '更新产品信息失败' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 