import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public/images/products')
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err)
        return res.status(500).json({ error: '上传失败' })
      }

      const uploadedFiles = Array.isArray(files.images) 
        ? files.images 
        : [files.images]

      const fileUrls = uploadedFiles.map(file => ({
        url: `/images/products/${path.basename(file.filepath)}`,
        name: file.originalFilename || '未命名文件'
      }))

      res.status(200).json({ files: fileUrls })
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: '服务器错误' })
  }
} 