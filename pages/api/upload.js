import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('文件上传失败:', err)
        return res.status(500).json({ message: '文件上传失败' })
      }

      const file = files.file[0]
      const fileName = file.newFilename
      const fileUrl = `/uploads/${fileName}`

      res.status(200).json({ 
        success: true, 
        url: fileUrl 
      })
    })
  } catch (error) {
    console.error('文件上传错误:', error)
    res.status(500).json({ message: '文件上传失败' })
  }
} 