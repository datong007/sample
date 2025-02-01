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
    specs: {}
  })
  const [uploadedFiles, setUploadedFiles] = useState([])

  const categories = [
    '功能面料',
    '运动面料',
    '天然面料',
    '装饰面料',
    '环保面料',
    '保暖面料',
    '时装面料',
    '其他'
  ]

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        throw new Error('获取产品信息失败')
      }
      const data = await response.json()
      setProductData(data.product)
      if (data.product.images) {
        setUploadedFiles(data.product.images)
      }
    } catch (err) {
      console.error('Error fetching product:', err)
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
        throw new Error('上传失败')
      }

      const data = await response.json()
      setUploadedFiles(prev => [...prev, ...data.files])
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!productData.name || !productData.model || !productData.category) {
      alert('请填写必填字段')
      return
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productData,
          images: uploadedFiles
        })
      })

      if (!response.ok) {
        throw new Error('更新失败')
      }

      alert('更新成功')
      router.push('/admin/products')
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败，请重试')
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