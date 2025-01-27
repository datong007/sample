import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import styles from '../styles/Products.module.css'
import sharedStyles from '../styles/SharedBackground.module.css'

// 在组件顶部添加初始库存记录
const initialStocks = {
  1: 10,  // 产品ID: 初始库存
  2: 5,
  3: 8
}

export default function Products() {
  const { addToCart, cart, removeFromCart } = useCart()
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: '样品A',
      model: 'SA-001',
      description: '高品质测试样品', 
      details: '样品A是一款高品质的测试产品，具有优秀的性能表现。适用于各类测试场景。',
      variants: {
        colors: ['红色', '蓝色', '黑色'],
        weights: ['100g', '200g', '300g'],
        sizes: ['S', 'M', 'L', 'XL']
      },
      specs: {
        material: '高级塑料',
        size: '10cm x 10cm x 5cm',
        weight: '100g'
      },
      image: '/images/sample-a.jpg',
      stock: 10,
      category: '电子产品'
    },
    { 
      id: 2, 
      name: '样品B',
      model: 'SB-002',
      description: '高性能工业样品', 
      details: '样品B专为工业应用设计，具有极高的耐用性和可靠性。',
      variants: {
        colors: ['银色', '黑色', '金色'],
        weights: ['250g', '500g', '750g'],
        sizes: ['M', 'L', 'XL']
      },
      specs: {
        material: '合金材料',
        size: '20cm x 15cm x 8cm',
        weight: '250g'
      },
      image: '/images/sample-b.jpg',
      stock: 5,
      category: '工业用品'
    },
    { 
      id: 3, 
      name: '样品C',
      model: 'SC-003',
      description: '创新设计样品', 
      details: '样品C采用创新设计理念，为用户带来全新使用体验。',
      variants: {
        colors: ['红色', '蓝色', '黑色'],
        weights: ['150g', '200g', '250g'],
        sizes: ['S', 'M', 'L']
      },
      specs: {
        material: '复合材料',
        size: '15cm x 15cm x 5cm',
        weight: '150g'
      },
      image: '/images/sample-c.jpg',
      stock: 8,
      category: '创新产品'
    },
  ])
  
  const [addedItems, setAddedItems] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedVariants, setSelectedVariants] = useState({})

  // 添加获取实际库存的函数
  const fetchCurrentStock = async () => {
    try {
      const response = await fetch('/api/get-stock')
      const data = await response.json()
      if (data.success) {
        setProducts(prevProducts => 
          prevProducts.map(product => ({
            ...product,
            stock: data.stocks[product.id] || initialStocks[product.id]
          }))
        )
      }
    } catch (error) {
      console.error('获取库存失败:', error)
    }
  }

  // 在组件加载时获取最新库存
  useEffect(() => {
    fetchCurrentStock()
  }, [])

  // 更新库存的函数
  const updateStock = (productId, change) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId
          ? { ...product, stock: Math.max(0, product.stock + change) }
          : product
      )
    )
  }

  // 修改监听购物车变化的逻辑
  useEffect(() => {
    // 重置所有产品的库存
    setProducts(prevProducts => {
      const newProducts = prevProducts.map(product => ({
        ...product,
        stock: initialStocks[product.id] || product.stock
      }))
      
      // 根据购物车中的数量减少库存
      cart.items.forEach(cartItem => {
        const product = newProducts.find(p => p.id === cartItem.id)
        if (product) {
          product.stock = initialStocks[product.id] - cartItem.quantity
        }
      })
      return newProducts
    })
  }, [cart.items])

  const handleAddToCart = (product) => {
    try {
      if (product.stock <= 0) {
        alert('库存不足')
        return
      }

      const variants = selectedVariants[product.id] || {}
      const productWithVariants = {
        ...product,
        selectedVariants: variants
      }
      
      addToCart(productWithVariants)
      
      setAddedItems(prev => ({
        ...prev,
        [product.id]: true
      }))
      setTimeout(() => {
        setAddedItems(prev => ({
          ...prev,
          [product.id]: false
        }))
      }, 1000)
    } catch (error) {
      console.error('添加样品失败:', error)
    }
  }

  const handleVariantSelect = (productId, type, value) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }))
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // 在 Products 组件内部添加过滤函数
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      // 搜索产品名称
      product.name.toLowerCase().includes(searchLower) ||
      // 搜索产品编号
      product.model.toLowerCase().includes(searchLower)
    ) && (
      // 分类过滤
      selectedCategory === '' || product.category === selectedCategory
    );
  });

  return (
    <div className={sharedStyles.pageContainer}>
      <Head>
        <title>挑选样品</title>
        <meta name="description" content="可用样品列表" />
      </Head>

      <main className={sharedStyles.mainContent}>
        <div className={styles.mainContent}>
          <div className={styles.filters}>
            <div className={styles.topBar}>
              <div className={styles.searchSection}>
                <Link href="/" className={styles.backHomeButton}>
                  返回首页
                </Link>
                <div className={styles.searchBar}>
                  <div className={styles.searchInputWrapper}>
                    <input 
                      type="text" 
                      placeholder="搜索产品名称或编号..."
                      className={styles.searchInput}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                    />
                    <button className={styles.searchButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <Link href="/sample-list" className={styles.sampleListButton}>
                查看已选样品
                {cart.items.length > 0 && (
                  <span className={styles.sampleCount}>
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
            </div>
            <div className={styles.categories}>
              <button 
                className={`${styles.categoryButton} ${selectedCategory === '' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                全部样品
              </button>
              <button 
                className={`${styles.categoryButton} ${selectedCategory === '电子产品' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('电子产品')}
              >
                电子产品
              </button>
              <button 
                className={`${styles.categoryButton} ${selectedCategory === '工业用品' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('工业用品')}
              >
                工业用品
              </button>
              <button 
                className={`${styles.categoryButton} ${selectedCategory === '创新产品' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('创新产品')}
              >
                创新产品
              </button>
            </div>
          </div>
          
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.titleSection}>
                    <h2>{product.name}</h2>
                    <span className={styles.codeTag}>{product.model}</span>
                  </div>
                  <p className={styles.description}>{product.description}</p>
                  
                  <div className={styles.variantsSection}>
                    {product.variants.colors && (
                      <div className={styles.variantGroup}>
                        <span className={styles.variantLabel}>颜色标签：</span>
                        <div className={styles.variantOptions}>
                          {product.variants.colors.map(color => (
                            <button
                              key={color}
                              className={`${styles.variantTag} ${
                                selectedVariants[product.id]?.color === color ? styles.selected : ''
                              }`}
                              onClick={() => handleVariantSelect(product.id, 'color', color)}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.variants.weights && (
                      <div className={styles.variantGroup}>
                        <span className={styles.variantLabel}>克重标签：</span>
                        <div className={styles.variantOptions}>
                          {product.variants.weights.map(weight => (
                            <button
                              key={weight}
                              className={`${styles.variantTag} ${
                                selectedVariants[product.id]?.weight === weight ? styles.selected : ''
                              }`}
                              onClick={() => handleVariantSelect(product.id, 'weight', weight)}
                            >
                              {weight}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.variants.sizes && (
                      <div className={styles.variantGroup}>
                        <span className={styles.variantLabel}>尺寸标签：</span>
                        <div className={styles.variantOptions}>
                          {product.variants.sizes.map(size => (
                            <button
                              key={size}
                              className={`${styles.variantTag} ${
                                selectedVariants[product.id]?.size === size ? styles.selected : ''
                              }`}
                              onClick={() => handleVariantSelect(product.id, 'size', size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className={styles.stock}>
                    库存: <span>{product.stock}</span> 件
                  </p>
                  <div className={styles.cardActions}>
                    <Link href={`/products/${product.id}`} className={styles.detailsButton}>
                      查看详情
                    </Link>
                    <button 
                      className={`${styles.button} ${addedItems[product.id] ? styles.added : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={addedItems[product.id]}
                    >
                      {addedItems[product.id] ? '已添加 ✓' : '添加样品'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <button 
        onClick={scrollToTop} 
        className={styles.backToTop}
      >
        返回顶部
      </button>
    </div>
  )
} 