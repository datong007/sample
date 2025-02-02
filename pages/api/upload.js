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
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFiles: 5,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    const [fields, files] = await form.parse(req)
    
    const uploadedFiles = Array.isArray(files.files) 
      ? files.files 
      : [files.files]

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
    res.status(500).json({ 
      success: false, 
      message: '文件上传失败' 
    })
  }
} 