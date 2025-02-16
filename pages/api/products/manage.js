import fs from 'fs'
import path from 'path'

const MAPPINGS_FILE = path.join(process.cwd(), 'data', 'product-mappings.json')

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const product = req.body

      // 读取映射文件
      const mappings = JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf8'))
      
      // 生成关联ID
      const prefix = product.model.replace(/[^A-Z0-9]/gi, '') // 移除特殊字符
      const count = (mappings.products.length + 1).toString().padStart(3, '0')
      const newId = `${prefix}-${count}`

      const newProduct = {
        id: newId,
        ...product,
        createdAt: new Date().toISOString()
      }

      // 更新映射文件
      mappings.products.push({
        id: newId,
        name: product.name,
        model: product.model,
        category: product.category,
        description: product.description,
        specs: product.specs
      })

      fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(mappings, null, 2))
      
      res.status(200).json(newProduct)
    } catch (error) {
      console.error('Error adding product:', error)
      res.status(500).json({ error: '添加产品失败' })
    }
  } else if (req.method === 'GET') {
    try {
      const mappings = JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf8'))
      res.status(200).json({ products: mappings.products })
    } catch (error) {
      console.error('Error getting products:', error)
      res.status(500).json({ error: '获取产品列表失败' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 