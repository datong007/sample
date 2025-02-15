import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../styles/AdminProducts.module.css'
import { updateStock } from '../../utils/stock'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingStock, setEditingStock] = useState(null)
  const [stockValue, setStockValue] = useState('')

  const categories = [
    '全部',
    '专业版盒子',
    '喂食器',
    '铅坠',
    '塑料盒',
    '塑料配件',
    '鱼钩',
    '金属配件',
    '工具'
  ]

  const handleBatchDelete = async () => {
    if (!confirm('确定要删除选中的产品吗？')) return

    try {
      const response = await fetch('/api/products/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productIds: Array.from(selectedProducts)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '批量删除失败')
      }

      // 刷新产品列表
      await fetchProducts()
      setSelectedProducts(new Set())
      alert('删除成功')
    } catch (error) {
      console.error('批量删除失败:', error)
      alert(error.message || '删除失败，请重试')
    }
  }

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const success = await updateStock(productId, parseInt(newStock))
      
      if (!success) {
        throw new Error('更新库存失败')
      }
      
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, stock: parseInt(newStock) }
            : product
        )
      )
      setEditingStock(null)
      setStockValue('')
    } catch (error) {
      console.error('更新库存失败:', error)
      alert('更新库存失败，请重试')
    }
  }

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
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '删除失败')
      }

      // 刷新产品列表
      await fetchProducts()
      alert('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert(error.message || '删除失败，请重试')
    }
  }

  const filteredProducts = products.filter(product => {
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
        <Head>
          <title>产品管理</title>
          <meta name="description" content="管理产品" />
        </Head>

        <div className={styles.header}>
          <h1>产品管理</h1>
          <div className={styles.actions}>
            <Link href="/admin/upload" className={styles.addButton}>
              添加新产品
            </Link>
            {selectedProducts.size > 0 && (
              <button 
                className={styles.deleteButton}
                onClick={handleBatchDelete}
              >
                删除选中 ({selectedProducts.size})
              </button>
            )}
          </div>
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
                <div className={styles.cardHeader}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedProducts)
                      if (e.target.checked) {
                        newSelected.add(product.id)
                      } else {
                        newSelected.delete(product.id)
                      }
                      setSelectedProducts(newSelected)
                    }}
                    className={styles.checkbox}
                  />
                  <img 
                    src={product.image || '/images/no-image.png'} 
                    alt={product.name}
                    className={styles.productImage}
                  />
                </div>

                <div className={styles.cardBody}>
                  <h3>{product.name}</h3>
                  <p className={styles.model}>型号：{product.model}</p>
                  <p className={styles.category}>分类：{product.category}</p>
                  
                  <div className={styles.stockSection}>
                    {editingStock === product.id ? (
                      <div className={styles.stockEdit}>
                        <input
                          type="number"
                          value={stockValue}
                          onChange={(e) => setStockValue(e.target.value)}
                          min="0"
                          className={styles.stockInput}
                        />
                        <button
                          onClick={() => handleStockUpdate(product.id, stockValue)}
                          className={styles.saveButton}
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingStock(null)
                            setStockValue('')
                          }}
                          className={styles.cancelButton}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <div className={styles.stockDisplay}>
                        <span>库存：{product.stock || 0}</span>
                        <button
                          onClick={() => {
                            setEditingStock(product.id)
                            setStockValue(product.stock?.toString() || '0')
                          }}
                          className={styles.editButton}
                        >
                          修改
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className={styles.editButton}
                    >
                      编辑
                    </Link>
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