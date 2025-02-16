import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')
const MAPPINGS_FILE = path.join(process.cwd(), 'data', 'product-mappings.json')

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

  if (req.method === 'GET') {
    try {
      const mappings = JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf8'))
      const product = mappings.products.find(p => p.id === id)
      
      if (product) {
        res.status(200).json(product)
      } else {
        res.status(404).json({ error: '产品未找到' })
      }
    } catch (error) {
      console.error('Error getting product:', error)
      res.status(500).json({ error: '获取产品信息失败' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 