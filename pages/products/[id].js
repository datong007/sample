import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/ProductDetail.module.css'
import { useCart } from '../../context/CartContext'

const products = [
  { 
    id: 1, 
    name: '样品A', 
    model: 'SA-001',
    specs: {
      material: '高级塑料',
      size: '10cm x 10cm x 5cm',
      weight: '100g'
    },
    usage: '适用于电子产品外壳测试、耐久性测试等场景',
    details: '样品A是一款高品质的测试产品，具有优秀的性能表现。适用于各类测试场景。',
    stock: 10,
    category: '电子产品',
    image: '/images/sample-a.jpg'
  },
  { 
    id: 2, 
    name: '样品B',
    model: 'SB-002',
    specs: {
      material: '合金材料',
      size: '20cm x 15cm x 8cm',
      weight: '250g'
    },
    usage: '适用于工业零件测试、强度测试等场景',
    details: '样品B专为工业应用设计，具有极高的耐用性和可靠性。',
    stock: 5,
    category: '工业用品',
    image: '/images/sample-b.jpg'
  },
  { 
    id: 3, 
    name: '样品C',
    model: 'SC-003',
    specs: {
      material: '复合材料',
      size: '15cm x 15cm x 6cm',
      weight: '150g'
    },
    usage: '适用于新材料测试、性能评估等场景',
    details: '样品C采用创新设计理念，为用户带来全新使用体验。',
    stock: 8,
    category: '创新产品',
    image: '/images/sample-c.jpg'
  }
]

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const product = products.find(p => p.id === Number(id))
  const { addToCart } = useCart()

  if (!product) {
    return <div>产品未找到</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{product.name} - 详情</title>
        <meta name="description" content={product.details} />
      </Head>

      <main className={styles.main}>
        <div className={styles.productDetail}>
          <div className={styles.imageSection}>
            <img 
              src={product.image} 
              alt={product.name}
              className={styles.productImage}
            />
          </div>
          
          <div className={styles.infoSection}>
            <h1>{product.name}</h1>
            <div className={styles.basicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>编号：</span>
                <span>{product.model}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>库存：</span>
                <span>{product.stock} 件</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>类别：</span>
                <span>{product.category}</span>
              </div>
            </div>

            <div className={styles.specSection}>
              <h2>规格参数</h2>
              <div className={styles.specGrid}>
                <div className={styles.specItem}>
                  <span className={styles.label}>材质</span>
                  <span>{product.specs.material}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.label}>尺寸</span>
                  <span>{product.specs.size}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.label}>重量</span>
                  <span>{product.specs.weight}</span>
                </div>
              </div>
            </div>

            <div className={styles.usageSection}>
              <h2>用途说明</h2>
              <p>{product.usage}</p>
            </div>

            <div className={styles.description}>
              <h2>详细说明</h2>
              <p>{product.details}</p>
            </div>

            <div className={styles.actions}>
              <Link href="/products" className={styles.backButton}>
                返回列表
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 