import { useState, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Upload.module.css'

export default function Upload() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [error, setError] = useState('')
  const [productInfo, setProductInfo] = useState({
    name: '',
    model: '',
    description: '',
    category: ''
  })
  const fileInputRef = useRef(null)

  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 设置目标尺寸
        const targetWidth = 800
        const targetHeight = 800
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        // 绘制白色背景
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
        
        // 计算缩放和位置以保持比例
        const scale = Math.min(targetWidth / img.width, targetHeight / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (targetWidth - scaledWidth) / 2
        const y = (targetHeight - scaledHeight) / 2
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        // 转换为Blob
        canvas.toBlob((blob) => {
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(newFile)
        }, 'image/jpeg', 0.85)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片加载失败'))
      }
    })
  }

  const handleUpload = async (files) => {
    if (!files.length) return

    setUploading(true)
    setError('')
    
    try {
      // 处理每个图片
      const processedFiles = await Promise.all(
        Array.from(files).map(processImage)
      )
      
      const formData = new FormData()
      processedFiles.forEach(file => {
        formData.append('images', file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        throw new Error('上传失败')
      }
      
      const data = await res.json()
      setUploadedFiles(prev => [...prev, ...data.files])
    } catch (error) {
      console.error('上传失败:', error)
      setError('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleUpload(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProductInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!uploadedFiles.length) {
      setError('请先上传图片')
      return
    }

    if (!productInfo.name || !productInfo.model) {
      setError('请填写产品名称和编号')
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productInfo,
          images: uploadedFiles,
        }),
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      const result = await response.json()
      if (result.success) {
        alert('产品添加成功！')
        // 清空表单
        setUploadedFiles([])
        setProductInfo({
          name: '',
          model: '',
          description: '',
          category: ''
        })
      }
    } catch (error) {
      console.error('提交失败:', error)
      setError('提交失败，请重试')
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>图片上传</title>
        <meta name="description" content="上传产品图片" />
      </Head>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <Link href="/admin" className={styles.backLink}>
            返回管理后台
          </Link>
          <h1>产品图片上传</h1>
        </div>

        <div className={styles.uploadInfo}>
          <h3>上传说明</h3>
          <ul>
            <li>支持 JPG、PNG 格式图片</li>
            <li>单个文件大小不超过 5MB</li>
            <li>建议图片尺寸 800x800 像素</li>
          </ul>
        </div>

        <div 
          className={styles.uploadArea}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files)}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <p>点击或拖拽图片到此处上传</p>
          {uploading && <p>上传中...</p>}
        </div>

        <div className={styles.productForm}>
          <h2>产品信息</h2>
          <div className={styles.formGroup}>
            <label htmlFor="name">产品名称 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={productInfo.name}
              onChange={handleInputChange}
              placeholder="请输入产品名称"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model">产品编号 *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={productInfo.model}
              onChange={handleInputChange}
              placeholder="请输入产品编号"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">产品类别</label>
            <select
              id="category"
              name="category"
              value={productInfo.category}
              onChange={handleInputChange}
            >
              <option value="">请选择类别</option>
              <option value="电子产品">电子产品</option>
              <option value="工业用品">工业用品</option>
              <option value="新材料">新材料</option>
              <option value="医疗用品">医疗用品</option>
              <option value="建材">建材</option>
              <option value="纺织品">纺织品</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">产品描述</label>
            <textarea
              id="description"
              name="description"
              value={productInfo.description}
              onChange={handleInputChange}
              placeholder="请输入产品描述"
              rows="4"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={uploading}
          >
            提交产品
          </button>
        </div>

        {uploadedFiles.length > 0 && (
          <div className={styles.preview}>
            <h3>已上传图片预览</h3>
            <div className={styles.previewGrid}>
              {uploadedFiles.map((file, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={file.url} alt={file.name} />
                  <p>{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 