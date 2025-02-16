import { useState, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/Upload.module.css'
import AdminLayout from '../../components/AdminLayout'

export default function Upload() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [productInfo, setProductInfo] = useState({
    name: '',
    model: '',
    description: '',
    category: '',
    specs: {
      材料: '',
      尺寸: '',
      克重: '',
      其他规格: ''
    }
  })
  const fileInputRef = useRef(null)

  const categories = [
    '专业版盒子',
    '喂食器',
    '铅坠',
    '塑料盒',
    '塑料配件',
    '鱼钩',
    '金属配件',
    '工具'
  ]

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
          if (!blob) {
            reject(new Error('图片处理失败'))
            return
          }
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
    if (!files || !files.length) {
      setError('请选择要上传的图片')
      return
    }

    if (files.length > 5) {
      setError('一次最多上传5张图片')
      return
    }

    // 验证文件类型和大小
    const invalidFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('只能上传图片文件')
        return true
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('图片大小不能超过 5MB')
        return true
      }
      return false
    })

    if (invalidFiles.length > 0) {
      return
    }

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
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || '上传失败')
      }
      
      setUploadedFiles(prev => [...prev, ...data.files])
      setError('')
    } catch (error) {
      console.error('上传失败:', error)
      setError(error.message || '上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    handleUpload(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    handleUpload(files)
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

  const handleSpecChange = (specName, value) => {
    setProductInfo(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [specName]: value
      }
    }))
  }

  const handleSubmit = async () => {
    if (!productInfo.name || !productInfo.model || !productInfo.category) {
      setError('请填写必填字段')
      return
    }

    if (uploadedFiles.length === 0) {
      setError('请至少上传一张图片')
      return
    }

    try {
      setUploading(true)
      setError('')

      // 准备提交的数据
      const submitData = {
        ...productInfo,
        images: uploadedFiles,
        image: uploadedFiles[0].url // 使用第一张图片作为主图
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      alert('产品添加成功')
      // 重置表单
      setProductInfo({
        name: '',
        model: '',
        description: '',
        category: '',
        specs: {
          材料: '',
          尺寸: '',
          克重: '',
          其他规格: ''
        }
      })
      setUploadedFiles([])
    } catch (error) {
      console.error('提交失败:', error)
      setError('提交失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>添加新产品 - 管理后台</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>添加新产品</h1>
            <Link href="/admin/products" className={styles.manageLink}>
              管理现有产品
            </Link>
          </div>
        </div>
        
        <div className={styles.uploadContainer}>
          <div className={styles.uploadArea}>
            <div 
              className={`${styles.uploadBox} ${dragActive ? styles.dragActive : ''}`}
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <p>点击或拖拽图片到此处上传</p>
              <p>支持 JPG、PNG 格式，单个文件不超过 5MB</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".jpg,.png"
                multiple
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <div className={styles.previewArea}>
            <h3>已上传图片</h3>
            <div className={styles.previewGrid}>
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img src={file.url} alt={`预览图片 ${index + 1}`} />
                    <button
                      className={styles.removeBtn}
                      onClick={() => {
                        setUploadedFiles(files => files.filter((_, i) => i !== index))
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p>暂无已上传图片</p>
              )}
            </div>
          </div>
        </div>

        <form className={styles.form} onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}>
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
              <label htmlFor="category">产品类别 *</label>
              <select
                id="category"
                name="category"
                value={productInfo.category}
                onChange={handleInputChange}
                required
              >
                <option value="">请选择类别</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
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

            <div className={styles.formGroup}>
              <label>规格信息</label>
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <label>材料</label>
                  <input
                    type="text"
                    value={productInfo.specs.材料}
                    onChange={(e) => handleSpecChange('材料', e.target.value)}
                    placeholder="例如：棉、涤纶等"
                  />
                </div>
                <div className={styles.specItem}>
                  <label>尺寸</label>
                  <input
                    type="text"
                    value={productInfo.specs.尺寸}
                    onChange={(e) => handleSpecChange('尺寸', e.target.value)}
                    placeholder="例如：150cm×100cm"
                  />
                </div>
                <div className={styles.specItem}>
                  <label>克重</label>
                  <input
                    type="text"
                    value={productInfo.specs.克重}
                    onChange={(e) => handleSpecChange('克重', e.target.value)}
                    placeholder="例如：200g/㎡"
                  />
                </div>
                <div className={styles.specItem}>
                  <label>其他规格</label>
                  <input
                    type="text"
                    value={productInfo.specs.其他规格}
                    onChange={(e) => handleSpecChange('其他规格', e.target.value)}
                    placeholder="其他规格信息"
                  />
                </div>
              </div>
            </div>

            <button 
              className={styles.submitButton}
              type="submit"
              disabled={uploading || !uploadedFiles.length}
            >
              {uploading ? '提交中...' : '提交产品'}
            </button>
          </div>
        </form>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </AdminLayout>
  )
} 