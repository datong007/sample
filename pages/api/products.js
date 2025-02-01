import fs from 'fs'
import path from 'path'

// 数据文件路径
const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 读取产品数据
const readProducts = () => {
  try {
    ensureDataDir()
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
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2))
    return true
  } catch (error) {
    console.error('保存产品数据失败:', error)
    return false
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const products = readProducts()
        res.status(200).json({ success: true, products })
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: '获取产品列表失败'
        })
      }
      break

    case 'POST':
      try {
        const productData = req.body

        // 验证必填字段
        if (!productData.name || !productData.model || !productData.category) {
          return res.status(400).json({
            success: false,
            message: '请填写所有必填字段'
          })
        }

        // 验证图片
        if (!productData.images || productData.images.length === 0) {
          return res.status(400).json({
            success: false,
            message: '请至少上传一张图片'
          })
        }

        // 读取现有产品
        const products = readProducts()

        // 生成新产品
        const newProduct = {
          id: Date.now().toString(),
          ...productData,
          image: productData.images[0].url, // 使用第一张图片作为主图
          createdAt: new Date().toISOString()
        }

        // 添加新产品
        products.push(newProduct)

        // 保存更新后的产品列表
        if (!saveProducts(products)) {
          throw new Error('保存产品数据失败')
        }

        res.status(200).json({
          success: true,
          message: '产品添加成功',
          product: newProduct
        })
      } catch (error) {
        console.error('添加产品失败:', error)
        res.status(500).json({
          success: false,
          message: error.message || '服务器错误'
        })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
} 