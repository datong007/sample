import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import styles from '../../styles/ProductDetail.module.css'
import ImagePreview from '../../components/ImagePreview'

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [selectedPreview, setSelectedPreview] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)

  const fetchProduct = async (productId) => {
    try {
      setError(null)
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error('获取产品详情失败')
      }
      const data = await response.json()
      setProduct(data)
      if (data.images && data.images.length > 0) {
        setCurrentImage(0)
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProduct(id)
    }
  }, [id])

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return
    setQuantity(Math.max(1, newQuantity))
  }

  const handleAddToCart = () => {
    if (!product) return
    
    const success = addToCart({
      ...product,
      quantity,
    })

    if (success) {
      alert(`已添加 ${product.name} 到样品单`)
      setQuantity(1)
    }
  }

  const handleImageClick = (index) => {
    setCurrentImage(index)
    setSelectedPreview(product.images[index] || '/images/placeholder.jpg')
  }

  if (loading) {
    return <div className={styles.loading}>加载中...</div>
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => fetchProduct(id)} className={styles.retryButton}>
          重试
        </button>
      </div>
    )
  }

  if (!product) {
    return <div className={styles.error}>产品未找到</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{product.name} - 详情</title>
        <meta name="description" content={product.description} />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/products" className={styles.backButton}>
            ← 返回产品列表
          </Link>
        </div>

        <div className={styles.content}>
          <div className={styles.imageSection}>
            <div 
              className={styles.mainImage}
              onClick={() => setSelectedPreview(product.images?.[currentImage] || product.image || '/images/placeholder.jpg')}
            >
              <img 
                src={product.images?.[currentImage] || product.image || '/images/placeholder.jpg'} 
                alt={product.name}
                onError={(e) => {
                  if (!e.target.src.includes('placeholder.jpg')) {
                    e.target.src = '/images/placeholder.jpg';
                  }
                }}
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className={styles.thumbnails}>
                {product.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`${styles.thumbnail} ${currentImage === index ? styles.active : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - 图片 ${index + 1}`}
                      onError={(e) => {
                        if (!e.target.src.includes('placeholder.jpg')) {
                          e.target.src = '/images/placeholder.jpg';
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.details}>
            <div className={styles.basicInfo}>
              <h1 className={styles.productName}>{product.name}</h1>
              <p className={styles.model}>编号: {product.model}</p>
              <p className={styles.description}>{product.description}</p>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className={styles.specsContainer}>
                <div className={styles.specsList}>
                  {Object.entries(product.specs).map(([key, value]) => (
                    value && (
                      <span key={key} className={styles.specTag}>
                        {key}: {value}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <div className={styles.quantitySection}>
                <label className={styles.quantityLabel}>数量：</label>
                <div className={styles.quantityControl}>
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className={styles.quantityButton}
                    disabled={quantity <= 1}
                  >-</button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className={styles.quantityInput}
                  />
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className={styles.quantityButton}
                  >+</button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={styles.addToCartButton}
              >
                添加到样品单
              </button>
            </div>
          </div>
        </div>
      </main>

      {selectedPreview && (
        <ImagePreview
          image={selectedPreview}
          onClose={() => setSelectedPreview(null)}
        />
      )}
    </div>
  )
} 