import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { productIds } = req.body
    console.log('要删除的产品ID:', productIds)
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: '无效的请求数据' })
    }

    // 读取现有产品数据
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    console.log('产品数据文件路径:', productsPath)
    
    if (!fs.existsSync(productsPath)) {
      return res.status(404).json({ message: '产品数据文件不存在' })
    }

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: '产品数据格式错误' })
    }
    
    console.log('当前产品总数:', products.length)

    // 过滤掉要删除的产品
    const updatedProducts = products.filter(
      product => !productIds.includes(product.id)
    )
    console.log('删除后剩余产品数:', updatedProducts.length)

    // 删除相关的图片文件
    const deletedProducts = products.filter(
      product => productIds.includes(product.id)
    )
    console.log('要删除的产品数:', deletedProducts.length)
    
    const errors = []
    
    for (const product of deletedProducts) {
      console.log('正在处理产品:', product.id)
      
      try {
        if (product.image) {
          // 移除URL中的开头的斜杠
          const imageRelativePath = product.image.replace(/^\//, '')
          const imagePath = path.join(process.cwd(), 'public', imageRelativePath)
          console.log('尝试删除主图:', imagePath)
          
          if (fs.existsSync(imagePath)) {
            try {
              fs.unlinkSync(imagePath)
              console.log('主图删除成功:', imagePath)
            } catch (err) {
              console.error(`删除主图失败: ${imagePath}`, err)
              errors.push(`删除主图失败: ${err.message}`)
            }
          } else {
            console.log('主图文件不存在:', imagePath)
          }
        }
        
        // 删除其他图片
        if (product.images && Array.isArray(product.images)) {
          console.log(`开始删除附加图片，数量: ${product.images.length}`)
          for (const image of product.images) {
            if (!image.url) continue
            
            // 移除URL中的开头的斜杠
            const imageRelativePath = image.url.replace(/^\//, '')
            const imagePath = path.join(process.cwd(), 'public', imageRelativePath)
            console.log('尝试删除附加图片:', imagePath)
            
            if (fs.existsSync(imagePath)) {
              try {
                fs.unlinkSync(imagePath)
                console.log('附加图片删除成功:', imagePath)
              } catch (err) {
                console.error(`删除附加图片失败: ${imagePath}`, err)
                errors.push(`删除附加图片失败: ${err.message}`)
              }
            } else {
              console.log('附加图片文件不存在:', imagePath)
            }
          }
        }
      } catch (err) {
        console.error(`处理产品 ${product.id} 时出错:`, err)
        errors.push(`处理产品 ${product.id} 失败: ${err.message}`)
      }
    }

    // 保存更新后的数据
    try {
      fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2))
      console.log('产品数据已更新')
    } catch (err) {
      console.error('保存产品数据失败:', err)
      return res.status(500).json({ 
        message: '保存产品数据失败', 
        error: err.message,
        errors 
      })
    }

    if (errors.length > 0) {
      return res.status(207).json({ 
        message: '部分操作成功',
        errors,
        success: true
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('批量删除产品失败:', error)
    res.status(500).json({ 
      message: '批量删除失败', 
      error: error.message 
    })
  }
} 