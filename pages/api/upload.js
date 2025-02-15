import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const form = new formidable.IncomingForm({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFiles: 5,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: true,
      filter: function ({ mimetype }) {
        // 只允许图片文件
        return mimetype && mimetype.includes('image/')
      },
    })

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })
    
    if (!files || !files.images) {
      return res.status(400).json({
        success: false,
        message: '没有找到上传的图片'
      })
    }

    const uploadedFiles = Array.isArray(files.images) 
      ? files.images 
      : [files.images]

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      })
    }

    const processedFiles = uploadedFiles.map(file => ({
      name: file.originalFilename,
      url: `/uploads/${path.basename(file.filepath)}`,
      size: file.size,
      type: file.mimetype
    }))

    res.status(200).json({ 
      success: true, 
      files: processedFiles 
    })
  } catch (error) {
    console.error('上传失败:', error)
    const errorMessage = error.message || '文件上传失败'
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    })
  }
} 