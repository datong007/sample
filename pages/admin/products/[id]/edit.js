import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../../components/AdminLayout'
import styles from '../../../../styles/ProductEdit.module.css'

export default function EditProduct() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productData, setProductData] = useState({
    name: '',
    model: '',
    category: '',
    description: '',
    specs: {
      材料: '',
      尺寸: '',
      克重: ''
    }
  })
  const [uploadedFiles, setUploadedFiles] = useState([])

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

  useEffect(() => {
    if (id) {
      fetchProduct()
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setError(null)
      setLoading(true)
      
      if (!id) {
        throw new Error('产品ID无效')
      }

      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('产品未找到')
        }
        throw new Error('获取产品信息失败')
      }
      
      const product = await response.json()
      
      // 规范化产品数据
      setProductData({
        name: product.name || '',
        model: product.model || '',
        category: product.category || '',
        description: product.description || '',
        specs: {
          材料: product.specs?.材料 || '',
          尺寸: product.specs?.尺寸 || '',
          克重: product.specs?.克重 || '',
          其他规格: product.specs?.其他规格 || ''
        }
      })

      // 处理图片数据
      if (product.images && Array.isArray(product.images)) {
        setUploadedFiles(product.images)
      }
    } catch (err) {
      console.error('获取产品信息失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProductData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSpecChange = (key, value) => {
    setProductData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: value
      }
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // 验证文件大小和类型
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    const invalidFiles = files.filter(file => 
      file.size > maxSize || !validTypes.includes(file.type)
    )

    if (invalidFiles.length > 0) {
      alert('部分文件上传失败：\n文件大小不能超过5MB，且必须是jpg、png、gif或webp格式')
      return
    }

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '上传失败')
      }

      const data = await response.json()
      
      // 更新上传文件列表
      setUploadedFiles(prev => [...prev, ...data.files.map(file => ({
        url: file.url,
        name: file.name
      }))])
    } catch (error) {
      console.error('上传失败:', error)
      alert(error.message || '上传失败，请重试')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // 表单验证
      const validationErrors = []
      if (!productData.name) validationErrors.push('产品名称')
      if (!productData.model) validationErrors.push('产品编号')
      if (!productData.category) validationErrors.push('产品类别')
      if (uploadedFiles.length === 0) validationErrors.push('产品图片')

      if (validationErrors.length > 0) {
        setError(`请填写以下必填字段: ${validationErrors.join(', ')}`)
        return
      }

      // 准备提交数据
      const submitData = {
        ...productData,
        images: uploadedFiles,
        image: uploadedFiles[0]?.url || null // 确保没有图片时设为 null
      }

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '更新失败')
      }

      alert('更新成功')
      router.push('/admin/products')
    } catch (err) {
      console.error('Error updating product:', err)
      setError(err.message || '更新失败，请检查网络连接后重试')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>加载中...</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchProduct} className={styles.retryButton}>
            重试
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>编辑产品</h1>
          <button onClick={() => router.back()} className={styles.backButton}>
            返回
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>产品名称 *</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>产品编号 *</label>
            <input
              type="text"
              name="model"
              value={productData.model}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>产品类别 *</label>
            <select
              name="category"
              value={productData.category}
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
            <label>产品描述</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>规格参数</label>
            <div className={styles.specs}>
              <div className={styles.specItem}>
                <input
                  type="text"
                  placeholder="材料"
                  value={productData.specs.材料 || ''}
                  onChange={(e) => handleSpecChange('材料', e.target.value)}
                />
              </div>
              <div className={styles.specItem}>
                <input
                  type="text"
                  placeholder="尺寸"
                  value={productData.specs.尺寸 || ''}
                  onChange={(e) => handleSpecChange('尺寸', e.target.value)}
                />
              </div>
              <div className={styles.specItem}>
                <input
                  type="text"
                  placeholder="克重"
                  value={productData.specs.克重 || ''}
                  onChange={(e) => handleSpecChange('克重', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>产品图片</label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
              <div className={styles.imagePreview}>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img src={file.url} alt={file.name} />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles(files => 
                          files.filter((_, i) => i !== index)
                        )
                      }}
                      className={styles.removeImage}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              保存修改
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
} 