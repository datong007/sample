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
  const { cart, addToCart, stockLevels, setStockLevels } = useCart()
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (!Array.isArray(data?.products)) {
        console.error('Invalid products data:', data)
        setError('获取产品列表失败：数据格式错误')
        return
      }

      // 确保每个产品都有正确的规格格式
      const validatedProducts = data.products.map(product => {
        let specs = product.specs || {};
        
        // 如果 specs 是字符串，尝试解析它
        if (typeof specs === 'string') {
          try {
            specs = JSON.parse(specs);
          } catch (e) {
            console.error('规格解析错误:', e);
            specs = {};
          }
        }

        return {
          ...product,
          specs: {
            材料: specs.材料 || specs.material || '',
            尺寸: specs.尺寸 || specs.size || '',
            克重: specs.克重 || specs.weight || '',
            ...specs
          }
        };
      });

      setProducts(validatedProducts)
    } catch (error) {
      console.error('获取产品列表失败:', error)
      setError(error.message || '获取产品列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    const currentStock = stockLevels[product.id] ?? product.stock;
    
    // 检查库存是否足够
    if (quantity > currentStock) {
      alert('选择数量不能超过库存数量');
      return;
    }

    const success = addToCart({
      ...product,
      quantity,
      selectedVariants: product.variants || {}
    });

    if (success) {
      setAddedItems(prev => ({
        ...prev,
        [product.id]: true
      }));
      
      // 重置数量
      setQuantities(prev => ({
        ...prev,
        [product.id]: 1
      }));
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
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const currentStock = stockLevels[productId] ?? product.stock;
    
    // 确保数量不超过当前库存
    if (newQuantity > currentStock) {
      alert('选择数量不能超过库存数量');
      return;
    }
    
    // 确保数量在有效范围内
    const validQuantity = Math.max(1, Math.min(newQuantity, currentStock));
    
    setQuantities(prev => ({
      ...prev,
      [productId]: validQuantity
    }));
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
        product.model.toLowerCase().includes(searchLower);
      
      return matchesSearch && (searchTerm ? true : matchesCategory);
    })

  const categories = ['all', ...new Set(products.map(p => p.category))].filter(Boolean)

  return (
    <div className={styles.container}>
      <Head>
        <title>浏览样品</title>
        <meta name="description" content="浏览和选择样品" />
      </Head>

      <main className={styles.main}>
        {/* 顶部导航和搜索区域 */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>样品列表</h1>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="搜索样品名称或编号..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  onClick={() => handleSearch('')}
                  className={styles.clearSearch}
                  aria-label="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className={styles.navigation}>
            <Link href="/" className={styles.navButton}>
              <svg {...homeIconProps} />
              返回首页
            </Link>
            <Link href="/sample-list" className={styles.navButton}>
              <svg {...cartIconProps} />
              查看样品单
              {cart?.items?.length > 0 && (
                <span className={styles.badge}>{cart.items.length}</span>
              )}
            </Link>
          </div>
        </div>

        {/* 分类过滤器 */}
        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            全部
          </button>
          {categories.filter(c => c !== 'all').map(category => (
            <button
              key={category}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 产品网格 */}
        <div className={styles.productGrid}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Loading />
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={fetchProducts} className={styles.retryButton}>
                重试
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  <img 
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name} 
                    className={styles.productImage}
                    onError={(e) => {
                      if (!e.target.src.includes('placeholder.jpg')) {
                        e.target.src = '/images/placeholder.jpg'
                      }
                    }}
                    loading="lazy"
                  />
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.header}>
                    <h3>{product.name}</h3>
                  </div>
                  <p className={styles.model}>编号: {product.model}</p>
                  
                  <SpecsDisplay specs={product.specs} />

                  {product.stock > 0 ? (
                    <div className={styles.quantitySection}>
                      <label>数量:</label>
                      <div className={styles.quantityControl}>
                        <button 
                          className={styles.quantityButton}
                          onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                          disabled={quantities[product.id] <= 1}
                        >-</button>
                        <input
                          type="number"
                          min="1"
                          max={stockLevels[product.id] ?? product.stock}
                          value={quantities[product.id] || 1}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                          className={styles.quantityInput}
                        />
                        <button 
                          className={styles.quantityButton}
                          onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                          disabled={(quantities[product.id] || 1) >= (stockLevels[product.id] ?? product.stock)}
                        >+</button>
                      </div>
                      <span className={styles.stockInfo}>
                        库存: {stockLevels[product.id] ?? product.stock}
                      </span>
                    </div>
                  ) : (
                    <p className={styles.outOfStock}>暂无库存</p>
                  )}

                  <div className={styles.cardActions}>
                    <Link href={`/products/${product.id}`} className={styles.detailsButton}>
                      查看详情
                    </Link>
                    <button 
                      className={`${styles.button} ${addedItems[product.id] ? styles.added : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={addedItems[product.id] || (stockLevels[product.id] ?? product.stock) === 0}
                    >
                      {addedItems[product.id] ? '已添加 ✓' : 
                       (stockLevels[product.id] ?? product.stock) === 0 ? '无库存' : '添加样品'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>未找到匹配的产品</p>
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  清除搜索
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}