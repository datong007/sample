import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const STOCK_FILE = path.join(DATA_DIR, 'stock.json')

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

if (!fs.existsSync(STOCK_FILE)) {
  fs.writeFileSync(STOCK_FILE, JSON.stringify({ stock: {} }))
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const data = fs.readFileSync(STOCK_FILE, 'utf8')
        const stockData = JSON.parse(data)
        res.status(200).json(stockData)
      } catch (error) {
        console.error('读取库存失败:', error)
        res.status(500).json({ message: '获取库存失败' })
      }
      break

    case 'POST':
      try {
        const { productId, stock } = req.body
        const data = fs.readFileSync(STOCK_FILE, 'utf8')
        const stockData = JSON.parse(data)
        
        stockData.stock[productId] = stock
        
        fs.writeFileSync(STOCK_FILE, JSON.stringify(stockData, null, 2))
        res.status(200).json({ success: true })
      } catch (error) {
        console.error('更新库存失败:', error)
        res.status(500).json({ message: '更新库存失败' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
} 