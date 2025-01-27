import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' })
  }

  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        throw err
      }

      const imageFile = files.image

      // TODO: 实现图像搜索逻辑
      // 1. 处理上传的图片
      // 2. 提取图像特征
      // 3. 搜索相似图片
      // 4. 返回结果

      res.status(200).json({
        success: true,
        message: '图片已接收',
        // results: [] // 搜索结果
      })
    })
  } catch (error) {
    console.error('图片搜索失败:', error)
    res.status(500).json({ message: '处理图片时出错' })
  }
} 