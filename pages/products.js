import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import styles from '../styles/Products.module.css'
import Loading from '../components/Loading'
import CartBadge from '../components/CartBadge'
import SpecsDisplay from '../components/SpecsDisplay'

const homeIconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  children: [
    <path key="1" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
    <polyline key="2" points="9 22 9 12 15 12 15 22"></polyline>
  ]
};

const cartIconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  children: [
    <circle key="1" cx="9" cy="21" r="1"></circle>,
    <circle key="2" cx="20" cy="21" r="1"></circle>,
    <path key="3" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  ]
};

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVariants, setSelectedVariants] = useState({})
  const [addedItems, setAddedItems] = useState({})
  const { cart, addToCart, getTotalQuantity } = useCart()
  const [quantities, setQuantities] = useState({})
  const totalQuantity = getTotalQuantity()

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

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    
    const success = addToCart({
      ...product,
      quantity,
    })

    if (success) {
      setAddedItems(prev => ({
        ...prev,
        [product.id]: true
      }))
      
      // 重置数量
      setQuantities(prev => ({
        ...prev,
        [product.id]: 1
      }))

      // 显示添加成功提示
      alert(`已添加 ${product.name} 到样品单`)
    }
  }

  const handleVariantChange = (productId, type, value) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [type]: value
      }
    }))
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    // 确保数量在有效范围内
    const validQuantity = Math.max(1, newQuantity)
    
    setQuantities(prev => ({
      ...prev,
      [productId]: validQuantity
    }))
  }

  const handleSearch = (value) => {
    setSearchTerm(value);
    // 重置分类选择
    if (value) {
      setSelectedCategory('all');
    }
  }

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      if (!searchTerm) return matchesCategory;
      
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.model.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower);
      
      return matchesSearch && matchesCategory;
    })

  const categories = ['all', ...new Set(products.map(p => p.category))].filter(Boolean)

  return (
    <div className={styles.container}>
      <Head>
        <title>样品展示</title>
        <meta name="description" content="浏览可用的样品" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.headerControls}>
              <Link href="/" className={styles.navButton}>
                <svg {...homeIconProps} />
                返回首页
              </Link>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="搜索产品名称或编号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={styles.clearSearch}
                  >
                    ×
                  </button>
                )}
              </div>
              <Link href="/sample-list" className={`${styles.navButton} ${styles.cartButton}`}>
                <svg {...cartIconProps} />
                查看样品单
                {totalQuantity > 0 && (
                  <span className={styles.badge}>{totalQuantity}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.active : ''
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => {
              setLoading(true)
              fetchProducts()
            }} className={styles.retryButton}>
              重试
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.noResults}>
            <p>未找到匹配的产品</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className={styles.resetButton}
            >
              重置筛选
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    className={styles.image}
                    onError={(e) => {
                      if (!e.target.src.includes('placeholder.jpg')) {
                        e.target.src = '/images/placeholder.jpg';
                      }
                    }}
                  />
                </div>
                <div className={styles.content}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.model}>编号: {product.model}</p>
                  <p className={styles.description}>{product.description}</p>
                  
                  {/* 规格展示 */}
                  <div className={styles.specsContainer}>
                    <div className={styles.specsList}>
                      {Object.entries(product.specs || {}).map(([key, value]) => (
                        <span key={key} className={styles.specTag}>
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 数量选择 */}
                  <div className={styles.quantitySection}>
                    <label className={styles.quantityLabel}>数量：</label>
                    <div className={styles.quantityControl}>
                      <button 
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                        className={styles.quantityButton}
                        disabled={quantities[product.id] <= 1}
                      >-</button>
                      <input
                        type="number"
                        min="1"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                        className={styles.quantityInput}
                      />
                      <button 
                        onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                        className={styles.quantityButton}
                      >+</button>
                    </div>
                  </div>

                  {/* 添加到样品单按钮 */}
                  <button
                    className={`${styles.addButton} ${addedItems[product.id] ? styles.added : ''}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedItems[product.id] ? '已添加' : '添加到样品单'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className={styles.scrollTopButton}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      </main>
    </div>
  )
}