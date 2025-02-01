import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../styles/AdminProducts.module.css'
import Link from 'next/link'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    '全部',
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
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setError(null)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('获取产品列表失败')
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('确定要删除这个产品吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      // 刷新产品列表
      fetchProducts()
      alert('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      if (!searchTerm) return matchesCategory
      
      const searchLower = searchTerm.toLowerCase()
      return matchesCategory && (
        product.name.toLowerCase().includes(searchLower) ||
        product.model.toLowerCase().includes(searchLower)
      )
    })

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>产品管理</h1>
          <Link href="/admin/upload" className={styles.addButton}>
            添加产品
          </Link>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="搜索产品名称或编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoryFilter}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === '全部' ? 'all' : category)}
                className={`${styles.categoryButton} ${
                  (category === '全部' ? 'all' : category) === selectedCategory ? styles.active : ''
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchProducts} className={styles.retryButton}>
              重试
            </button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    className={styles.productImage}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg'
                    }}
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p className={styles.model}>编号: {product.model}</p>
                  <p className={styles.category}>类别: {product.category}</p>
                  
                  <div className={styles.specs}>
                    {product.specs && Object.entries(product.specs).map(([key, value]) => (
                      value && (
                        <span key={key} className={styles.specItem}>
                          {key}: {value}
                        </span>
                      )
                    ))}
                  </div>

                  <div className={styles.actions}>
                    <Link 
                      href={`/admin/products/${product.id}/edit`}
                      className={styles.editButton}
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className={styles.deleteButton}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 