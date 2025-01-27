import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import styles from '../styles/SampleList.module.css'
import sharedStyles from '../styles/SharedBackground.module.css'

export default function SampleList() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [orderNumber, setOrderNumber] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 添加联系信息状态
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  // 添加表单验证状态
  const [formErrors, setFormErrors] = useState({})

  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0)

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除对应的错误信息
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // 验证表单
  const validateForm = () => {
    const errors = {}
    if (!contactInfo.name.trim()) {
      errors.name = '请输入姓名'
    }
    if (!contactInfo.email.trim()) {
      errors.email = '请输入邮箱'
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      errors.email = '请输入有效的邮箱地址'
    }
    if (!contactInfo.phone.trim()) {
      errors.phone = '请输入电话'
    } else if (!/^1[3-9]\d{9}$/.test(contactInfo.phone)) {
      errors.phone = '请输入有效的手机号码'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleConfirm = async () => {
    if (isSubmitting) return
    
    // 验证表单
    if (!validateForm()) {
      alert('请先填写完整的联系信息，再点击确认样品，我们将尽快回复您，谢谢！')
      document.querySelector('#contactForm').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      })
      return
    }
    
    setIsSubmitting(true)
    try {
      // 1. 创建订单
      const orderData = {
        orderNumber: `SO${Date.now()}`,
        orderDate: new Date().toISOString(),
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants || {}
        })),
        totalItems,
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          notes: contactInfo.notes
        }
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        throw new Error('提交订单失败')
      }

      const orderResult = await orderResponse.json()
      
      if (orderResult.success) {
        // 2. 更新库存
        const stockUpdateResponse = await fetch('/api/update-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cart.items.map(item => ({
              id: item.id,
              quantity: item.quantity
            }))
          })
        })

        const stockResult = await stockUpdateResponse.json()
        
        if (stockResult.success) {
          setOrderNumber(orderResult.orderNumber)
          alert(`样品选择已确认！\n订单号：${orderResult.orderNumber}\n我们会尽快处理您的样品申请。`)
          clearCart()
        } else {
          throw new Error('库存更新失败')
        }
      } else {
        throw new Error(orderResult.message || '提交失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={sharedStyles.pageContainer}>
      <Head>
        <title>我的样品单</title>
        <meta name="description" content="我的已选样品清单" />
      </Head>

      <main className={sharedStyles.mainContent}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Link href="/" className={styles.backHomeButton}>
              返回首页
            </Link>
          </div>
          <Link href="/products" className={styles.browseButton}>
            继续选择样品
          </Link>
        </div>
        
        {orderNumber && (
          <div className={styles.orderInfo}>
            <p>样品单号: {orderNumber}</p>
            <p>状态: 处理中</p>
          </div>
        )}
        
        {cart.items.length === 0 ? (
          <div className={styles.empty}>
            <p>还未选择任何样品</p>
            <Link href="/products" className={styles.continueButton}>
              选择样品
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.sampleItems}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.sampleItem}>
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    {item.selectedVariants && (
                      <div className={styles.variants}>
                        {item.selectedVariants.color && (
                          <span className={styles.variant}>颜色: {item.selectedVariants.color}</span>
                        )}
                        {item.selectedVariants.weight && (
                          <span className={styles.variant}>克重: {item.selectedVariants.weight}</span>
                        )}
                        {item.selectedVariants.size && (
                          <span className={styles.variant}>尺码: {item.selectedVariants.size}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantity}>
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className={`${styles.quantityButton} ${isSubmitting ? styles.disabledButton : ''}`}
                        disabled={isSubmitting}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={`${styles.quantityButton} ${isSubmitting ? styles.disabledButton : ''}`}
                        disabled={isSubmitting}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className={`${styles.removeButton} ${isSubmitting ? styles.disabledButton : ''}`}
                      disabled={isSubmitting}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <div className={styles.total}>
                已选样品: {totalItems} 件
              </div>
              <button 
                className={`${styles.confirmButton} ${isSubmitting ? styles.submitting : ''} ${isSubmitting ? styles.disabledButton : ''}`}
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '确认样品'}
              </button>
            </div>

            {/* 联系信息表单 */}
            <div className={styles.contactForm} id="contactForm">
              <h2>联系信息</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">
                    姓名 * <span className={styles.required}>（必填）</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactInfo.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? styles.errorInput : ''}
                  />
                  {formErrors.name && <span className={styles.errorText}>{formErrors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    邮箱 * <span className={styles.required}>（必填）</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? styles.errorInput : ''}
                  />
                  {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">
                    电话 * <span className={styles.required}>（必填）</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? styles.errorInput : ''}
                  />
                  {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="notes">备注</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={contactInfo.notes}
                    onChange={handleInputChange}
                    placeholder="请输入其他需求说明..."
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
} 