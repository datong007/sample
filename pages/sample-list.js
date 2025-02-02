import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import styles from '../styles/SampleList.module.css'
import OrderHistory from '../components/OrderHistory'
import SpecsDisplay from '../components/SpecsDisplay'
import { getCurrentStock } from '../utils/stock'
import { ORDER_STATUS } from '../constants/orderStatus'

// 更新国际区号数据
const countryPhoneCodes = [
  // 亚洲
  { code: '86', country: '中国' },
  { code: '852', country: '中国香港' },
  { code: '853', country: '中国澳门' },
  { code: '886', country: '中国台湾' },
  { code: '81', country: '日本' },
  { code: '82', country: '韩国' },
  { code: '850', country: '朝鲜' },
  { code: '65', country: '新加坡' },
  { code: '60', country: '马来西亚' },
  { code: '66', country: '泰国' },
  { code: '84', country: '越南' },
  { code: '62', country: '印度尼西亚' },
  { code: '63', country: '菲律宾' },
  { code: '673', country: '文莱' },
  { code: '855', country: '柬埔寨' },
  { code: '856', country: '老挝' },
  { code: '95', country: '缅甸' },
  { code: '91', country: '印度' },
  { code: '92', country: '巴基斯坦' },
  { code: '93', country: '阿富汗' },
  { code: '94', country: '斯里兰卡' },
  { code: '880', country: '孟加拉国' },
  { code: '960', country: '马尔代夫' },
  { code: '975', country: '不丹' },
  { code: '976', country: '蒙古' },
  { code: '977', country: '尼泊尔' },
  
  // 中东
  { code: '98', country: '伊朗' },
  { code: '966', country: '沙特阿拉伯' },
  { code: '971', country: '阿联酋' },
  { code: '972', country: '以色列' },
  { code: '973', country: '巴林' },
  { code: '974', country: '卡塔尔' },
  { code: '961', country: '黎巴嫩' },
  { code: '962', country: '约旦' },
  { code: '963', country: '叙利亚' },
  { code: '964', country: '伊拉克' },
  { code: '965', country: '科威特' },
  { code: '967', country: '也门' },
  { code: '968', country: '阿曼' },
  { code: '970', country: '巴勒斯坦' },
  
  // 欧洲
  { code: '7', country: '俄罗斯联邦' },
  { code: '30', country: '希腊' },
  { code: '31', country: '荷兰' },
  { code: '32', country: '比利时' },
  { code: '33', country: '法国' },
  { code: '34', country: '西班牙' },
  { code: '39', country: '意大利' },
  { code: '40', country: '罗马尼亚' },
  { code: '41', country: '瑞士' },
  { code: '43', country: '奥地利' },
  { code: '44', country: '英国' },
  { code: '45', country: '丹麦' },
  { code: '46', country: '瑞典' },
  { code: '47', country: '挪威' },
  { code: '48', country: '波兰' },
  { code: '49', country: '德国' },
  { code: '350', country: '直布罗陀' },
  { code: '351', country: '葡萄牙' },
  { code: '352', country: '卢森堡' },
  { code: '353', country: '爱尔兰' },
  { code: '354', country: '冰岛' },
  { code: '355', country: '阿尔巴尼亚' },
  { code: '356', country: '马耳他' },
  { code: '357', country: '塞浦路斯' },
  { code: '358', country: '芬兰' },
  { code: '359', country: '保加利亚' },
  { code: '36', country: '匈牙利' },
  { code: '370', country: '立陶宛' },
  { code: '371', country: '拉脱维亚' },
  { code: '372', country: '爱沙尼亚' },
  { code: '373', country: '摩尔多瓦' },
  { code: '374', country: '亚美尼亚' },
  { code: '375', country: '白俄罗斯' },
  { code: '376', country: '安道尔' },
  { code: '377', country: '摩纳哥' },
  { code: '378', country: '圣马力诺' },
  { code: '380', country: '乌克兰' },
  { code: '381', country: '南斯拉夫' },
  { code: '385', country: '克罗地亚' },
  { code: '386', country: '斯洛文尼亚' },
  { code: '387', country: '波斯尼亚和塞哥维那' },
  { code: '389', country: '马其顿' },
  { code: '420', country: '捷克' },
  { code: '421', country: '斯洛伐克' },
  { code: '423', country: '列支敦士登' },
  { code: '3906698', country: '梵蒂冈' },
  
  // 非洲
  { code: '20', country: '埃及' },
  { code: '212', country: '摩洛哥' },
  { code: '213', country: '阿尔及利亚' },
  { code: '216', country: '突尼斯' },
  { code: '218', country: '利比亚' },
  { code: '220', country: '冈比亚' },
  { code: '221', country: '塞内加尔' },
  { code: '222', country: '毛里塔尼亚' },
  { code: '223', country: '马里' },
  { code: '224', country: '几内亚' },
  { code: '225', country: '科特迪瓦' },
  { code: '226', country: '布基纳法索' },
  { code: '227', country: '尼日尔' },
  { code: '228', country: '多哥' },
  { code: '229', country: '贝宁' },
  { code: '230', country: '毛里求斯' },
  { code: '231', country: '利比里亚' },
  { code: '232', country: '塞拉利昂' },
  { code: '233', country: '加纳' },
  { code: '234', country: '尼日利亚' },
  { code: '235', country: '乍得' },
  { code: '236', country: '中非' },
  { code: '237', country: '喀麦隆' },
  { code: '238', country: '佛得角' },
  { code: '239', country: '圣多美和普林西比' },
  { code: '240', country: '赤道几内亚' },
  { code: '241', country: '加蓬' },
  { code: '242', country: '刚果' },
  { code: '243', country: '扎伊尔' },
  { code: '244', country: '安哥拉' },
  { code: '245', country: '几内亚比绍' },
  { code: '246', country: '迪戈加西亚' },
  { code: '247', country: '阿森松' },
  { code: '248', country: '塞舌尔' },
  { code: '249', country: '苏丹' },
  { code: '250', country: '卢旺达' },
  { code: '251', country: '埃塞俄比亚' },
  { code: '252', country: '索马里' },
  { code: '253', country: '吉布提' },
  { code: '254', country: '肯尼亚' },
  { code: '255', country: '坦桑尼亚' },
  { code: '256', country: '乌干达' },
  { code: '257', country: '布隆迪' },
  { code: '258', country: '莫桑比克' },
  { code: '259', country: '桑给巴尔' },
  { code: '260', country: '赞比亚' },
  { code: '261', country: '马达加斯加' },
  { code: '262', country: '留尼旺岛' },
  { code: '263', country: '津巴布韦' },
  { code: '264', country: '纳米比亚' },
  { code: '265', country: '马拉维' },
  { code: '266', country: '莱索托' },
  { code: '267', country: '博茨瓦纳' },
  { code: '268', country: '斯威士兰' },
  { code: '269', country: '科摩罗和马约特岛' },
  { code: '27', country: '南非' },
  { code: '290', country: '圣赫勒拿' },
  { code: '291', country: '厄立特里亚' },
  { code: '297', country: '阿鲁巴岛' },
  { code: '298', country: '法罗群岛' },
  { code: '3422', country: '加那利群岛(圣克鲁斯)' },
  { code: '3428', country: '加那利群岛(拉斯帕尔马斯)' },
  
  // 北美洲
  { code: '1', country: '美国和加拿大' },
  { code: '1242', country: '巴哈马' },
  { code: '1246', country: '巴巴多斯' },
  { code: '1264', country: '安圭拉岛' },
  { code: '1268', country: '安提瓜和巴布达' },
  { code: '1340', country: '维尔京群岛' },
  { code: '1345', country: '开曼群岛' },
  { code: '1441', country: '百慕大群岛' },
  { code: '1473', country: '格林纳达' },
  { code: '1649', country: '特克斯和凯科斯群岛' },
  { code: '1664', country: '蒙特塞拉特岛' },
  { code: '1758', country: '圣卢西亚' },
  { code: '1767', country: '多米尼加联邦' },
  { code: '1784', country: '圣文森特岛' },
  { code: '1787', country: '波多黎各' },
  { code: '1809', country: '多米尼加共和国' },
  { code: '1868', country: '特立尼达和多巴哥' },
  { code: '1869', country: '圣克里斯托弗和尼维斯' },
  { code: '1876', country: '牙买加' },
  { code: '1907', country: '阿拉斯加' },
  { code: '508', country: '圣皮埃尔岛密克隆岛' },
  { code: '590', country: '瓜多罗普' },
  { code: '599', country: '荷属安的列斯群岛' },
  
  // 南美洲
  { code: '51', country: '秘鲁' },
  { code: '52', country: '墨西哥' },
  { code: '53', country: '古巴' },
  { code: '54', country: '阿根廷' },
  { code: '55', country: '巴西' },
  { code: '56', country: '智利' },
  { code: '57', country: '哥伦比亚' },
  { code: '58', country: '委内瑞拉' },
  { code: '500', country: '福克兰群岛' },
  { code: '501', country: '伯利兹' },
  { code: '502', country: '危地马拉' },
  { code: '503', country: '萨尔瓦多' },
  { code: '504', country: '洪都拉斯' },
  { code: '505', country: '尼加拉瓜' },
  { code: '506', country: '哥斯达黎加' },
  { code: '507', country: '巴拿马' },
  { code: '509', country: '海地' },
  { code: '591', country: '玻利维亚' },
  { code: '592', country: '圭亚那' },
  { code: '593', country: '厄瓜多尔' },
  { code: '594', country: '法属圭亚那' },
  { code: '595', country: '巴拉圭' },
  { code: '596', country: '马提尼克' },
  { code: '597', country: '苏里南' },
  { code: '598', country: '乌拉圭' },
  
  // 大洋洲
  { code: '61', country: '澳大利亚' },
  { code: '64', country: '新西兰' },
  { code: '672', country: '诺福克岛' },
  { code: '674', country: '瑙鲁' },
  { code: '675', country: '巴布亚新几内亚' },
  { code: '676', country: '汤加' },
  { code: '677', country: '所罗门群岛' },
  { code: '678', country: '瓦努阿图' },
  { code: '679', country: '斐济' },
  { code: '680', country: '帕劳' },
  { code: '682', country: '科克群岛' },
  { code: '683', country: '纽埃岛' },
  { code: '684', country: '东萨摩亚' },
  { code: '685', country: '西萨摩亚' },
  { code: '686', country: '基里巴斯' },
  { code: '687', country: '新喀里多尼亚群岛' },
  { code: '688', country: '图瓦卢' },
  { code: '689', country: '法属波利尼西亚' },
  { code: '690', country: '托克劳' },
  { code: '691', country: '密克罗尼西亚' },
  { code: '692', country: '马绍尔群岛' },
  { code: '1670', country: '马里亚纳群岛' },
  { code: '1671', country: '关岛' },
  { code: '1681', country: '瓦利斯和富图纳群岛' },
  { code: '619162', country: '科科斯岛' },
  { code: '619164', country: '圣诞岛' },
].sort((a, b) => a.country.localeCompare(b.country, 'zh-CN'))

// 添加状态文本映射
const STATUS_MAP = {
  pending: { text: '待处理', color: '#f6ad55' },
  processing: { text: '处理中', color: '#4299e1' },
  shipped: { text: '已发货', color: '#48bb78' },
  completed: { text: '已完成', color: '#38a169' },
  cancelled: { text: '已取消', color: '#e53e3e' }
}

// 获取状态显示文本
const getStatusText = (status) => {
  return STATUS_MAP[status]?.text || status
}

// 添加订单详情组件
const OrderDetails = ({ order, onClose }) => (
  <div className={styles.orderDetailsModal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2>订单详情</h2>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>

      <div className={styles.orderBasicInfo}>
        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <label>订单号：</label>
            <span>{order.orderNumber}</span>
          </div>
          <div className={styles.infoItem}>
            <label>提交时间：</label>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className={styles.infoItem}>
            <label>样品总数：</label>
            <span>{order.totalQuantity || order.items.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
          </div>
          <div className={styles.infoItem}>
            <label>状态：</label>
            <span className={`${styles.status} ${styles[order.status]}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.contactInfo}>
        <h3>联系信息</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>联系人：</label>
            <span>{order.contactInfo.name}</span>
          </div>
          <div className={styles.infoItem}>
            <label>电话：</label>
            <span>{order.contactInfo.phone}</span>
          </div>
          <div className={styles.infoItem}>
            <label>邮箱：</label>
            <span>{order.contactInfo.email}</span>
          </div>
        </div>
      </div>

      <div className={styles.sampleList}>
        <h3>样品清单</h3>
        <div className={styles.samples}>
          {order.items.map((item, index) => (
            <div key={index} className={styles.sampleItem}>
              <div className={styles.sampleImage}>
                <img 
                  src={item.image || '/images/placeholder.jpg'} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
              <div className={styles.sampleInfo}>
                <h4>{item.name}</h4>
                {item.model && <p className={styles.model}>型号：{item.model}</p>}
                <div className={styles.specs}>
                  {Object.entries(item.specs || {}).map(([key, value]) => (
                    value && (
                      <span key={key} className={styles.spec}>
                        {key}: {value}
                      </span>
                    )
                  ))}
                </div>
                <div className={styles.quantity}>
                  数量：{item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function SampleList() {
  const { cart, removeFromCart, updateQuantity, clearCart, stockLevels } = useCart()
  const [orderNumber, setOrderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [phoneCode, setPhoneCode] = useState('86')
  const [orders, setOrders] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!showHistory) return;
    fetchOrders();
  }, [showHistory]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders/list', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('获取订单失败');
      }

      const data = await response.json();
      
      if (data.success) {
        const validOrders = data.orders.filter(order => 
          order && order.orderNumber && order.items && order.items.length > 0
        );
        
        setOrders(validOrders);
        setLoading(false);
      } else {
        throw new Error(data.message || '获取订单失败');
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      setError('获取订单失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchOrders();
  };

  // 保存订单到历史记录
  const saveToHistory = (order) => {
    const newOrders = [order, ...orders]
    setOrders(newOrders)
    localStorage.setItem('orderHistory', JSON.stringify(newOrders))
  }

  const validateForm = () => {
    const errors = {}
    if (!contactInfo.name) errors.name = '请输入姓名'
    if (!contactInfo.email) errors.email = '请输入邮箱'
    if (!contactInfo.phone) errors.phone = '请输入电话'
    return errors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      // 生成订单号
      const orderNumber = `SO${Date.now()}`
      
      // 准备订单数据
      const orderData = {
        id: `order_${Date.now()}`,
        orderNumber,
        items: cart.items.map(item => ({
          name: item.name,
          image: item.image,
          model: item.model,
          quantity: item.quantity,
          specs: item.specs || {}
        })),
        contactInfo: {
          ...contactInfo,
          phone: `+${phoneCode}-${contactInfo.phone}`
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }

      // 提交订单
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.message || '提交订单失败')
      }

      const result = await orderResponse.json()
      if (result.success) {
        // 更新本地订单列表
        setOrders(prevOrders => [orderData, ...prevOrders])
        
        // 更新状态
        setOrderNumber(orderNumber)
        setSubmitSuccess(true)
        clearCart()
        
        // 显示成功提示
        alert(`样品单提交成功！\n订单号：${orderNumber}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        // 延迟重置提交状态
        setTimeout(() => {
          setSubmitSuccess(false)
          setOrderNumber('')
        }, 3000)
      } else {
        throw new Error(result.message || '提交失败')
      }
    } catch (error) {
      console.error('提交订单失败:', error)
      alert(error.message || '提交订单失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 计算总数量
  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  // 修改订单卡片组件
  const OrderCard = ({ order }) => (
    <div className={styles.orderCard}>
      <div className={styles.orderRow}>
        <div className={styles.orderInfo}>
          <div className={styles.orderNumber}>
            订单号：{order.orderNumber}
          </div>
          <div className={styles.orderDate}>
            提交时间：{new Date(order.createdAt).toLocaleString()}
          </div>
          <div className={styles.orderQuantity}>
            样品总数：{order.totalQuantity || order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
          </div>
        </div>
        <div className={styles.orderActions}>
          <span className={`${styles.status} ${styles[order.status]}`}>
            {getStatusText(order.status)}
          </span>
          {order.status === 'pending' && (
            <button 
              onClick={() => handleCancelOrder(order.orderNumber)}
              className={styles.cancelButton}
            >
              取消订单
            </button>
          )}
          <button 
            onClick={() => handleViewDetails(order.orderNumber)}
            className={styles.detailsButton}
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  )

  const handleCancelOrder = async (orderNumber) => {
    if (!confirm('确定要取消这个订单吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error('取消订单失败');
      }

      // 更新本地状态
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status: 'cancelled' }
            : order
        )
      );
    } catch (error) {
      console.error('取消订单失败:', error);
      alert('取消订单失败，请重试');
    }
  };

  // 修改查看详情处理函数
  const handleViewDetails = (orderNumber) => {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
      setSelectedOrder(order);
    }
  };

  // 添加关闭详情处理函数
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>我的样品单</title>
        <meta name="description" content="查看已选择的样品" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.navigation}>
              <Link href="/" className={styles.navButton}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                返回首页
              </Link>
              <Link href="/products" className={styles.navButton}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                继续浏览样品
              </Link>
              <button 
                className={`${styles.navButton} ${showHistory ? styles.active : ''}`}
                onClick={() => setShowHistory(!showHistory)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                历史订单
              </button>
            </div>
          </div>
        </div>

        {showHistory ? (
          <div className={styles.historySection}>
            <h2>历史订单</h2>
            {loading && <div className={styles.loading}>加载中...</div>}
            {error && (
              <div className={styles.error}>
                {error}
                <button 
                  onClick={handleRetry}
                  className={styles.retryButton}
                >
                  重试
                </button>
              </div>
            )}
            {!loading && !error && orders.length === 0 && (
              <div className={styles.emptyState}>
                <p>暂无订单记录</p>
              </div>
            )}
            {!loading && !error && orders.length > 0 && (
              <div className={styles.orderList}>
                {orders.map(order => (
                  <OrderCard key={order.orderNumber} order={order} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {submitSuccess && (
              <div className={styles.orderDetails}>
                <div className={styles.orderHeader}>
                  <h2>订单信息</h2>
                  <div className={styles.orderMeta}>
                    <p>订单号：<span>{orderNumber}</span></p>
                    <p>提交时间：<span>{new Date().toLocaleString()}</span></p>
                    <p>状态：<span className={styles.statusPending}>处理中</span></p>
                  </div>
                </div>

                <div className={styles.orderContent}>
                  <div className={styles.section}>
                    <h3>样品清单</h3>
                    <div className={styles.itemList}>
                      {cart.items.map(item => (
                        <div key={item.id} className={styles.orderItem}>
                          <div className={styles.itemImage}>
                            <img 
                              src={item.image || '/images/placeholder.jpg'} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = '/images/placeholder.jpg'
                              }}
                            />
                          </div>
                          <div className={styles.itemDetails}>
                            <h4>{item.name}</h4>
                            <p className={styles.itemModel}>编号: {item.model}</p>
                            <div className={styles.specs}>
                              <SpecsDisplay specs={item.specs} />
                            </div>
                          </div>
                          <div className={styles.itemQuantity}>
                            数量: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3>联系信息</h3>
                    <div className={styles.contactDetails}>
                      <p><strong>姓名：</strong>{contactInfo.name}</p>
                      <p><strong>邮箱：</strong>{contactInfo.email}</p>
                      <p><strong>电话：</strong>{contactInfo.phone}</p>
                      {contactInfo.company && (
                        <p><strong>公司：</strong>{contactInfo.company}</p>
                      )}
                      {contactInfo.notes && (
                        <p><strong>备注：</strong>{contactInfo.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <Link href="/products" className={styles.continueButton}>
                    继续浏览样品
                  </Link>
                </div>
              </div>
            )}

            {cart.items.length === 0 && !submitSuccess ? (
              <div className={styles.emptyCart}>
                <p>还未选择任何样品</p>
                <Link href="/products" className={styles.continueButton}>
                  去选择样品
                </Link>
              </div>
            ) : !submitSuccess && (
              <>
                <div className={styles.cartTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>图片</th>
                        <th>产品编号</th>
                        <th>产品名称</th>
                        <th>规格</th>
                        <th>数量</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => (
                        <tr key={item.id} className={styles.cartItem}>
                          <td className={styles.productImage}>
                            <img 
                              src={item.image || '/images/placeholder.jpg'} 
                              alt={item.name}
                              onError={(e) => {
                                if (!e.target.src.includes('placeholder.jpg')) {
                                  e.target.src = '/images/placeholder.jpg'
                                }
                              }}
                            />
                          </td>
                          <td className={styles.productId}>{item.model}</td>
                          <td className={styles.productName}>{item.name}</td>
                          <td className={styles.specs}>
                            {Object.entries(item.specs || {}).map(([key, value]) => (
                              <div key={key} className={styles.specItem}>
                                <span className={styles.specLabel}>{key}:</span>
                                <span className={styles.specValue}>{value}</span>
                              </div>
                            ))}
                          </td>
                          <td className={styles.quantityControl}>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className={styles.quantityButton}
                            >-</button>
                            <span className={styles.quantityValue}>{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className={styles.quantityButton}
                            >+</button>
                          </td>
                          <td className={styles.actions}>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className={styles.deleteButton}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className={styles.totalRow}>
                        <td colSpan="4" className={styles.totalLabel}>总数量</td>
                        <td colSpan="2" className={styles.totalValue}>{totalQuantity}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={styles.contactForm}>
                  <h2>联系信息</h2>
                  <div className={styles.formGrid}>
                    <div className={styles.formRow}>
                      <label>姓名 <span className={styles.required}>*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={contactInfo.name}
                        onChange={handleInputChange}
                        className={formErrors.name ? styles.errorInput : ''}
                      />
                      {formErrors.name && <span className={styles.errorText}>{formErrors.name}</span>}
                    </div>

                    <div className={styles.formRow}>
                      <label>邮箱 <span className={styles.required}>*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? styles.errorInput : ''}
                      />
                      {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
                    </div>

                    <div className={styles.formRow}>
                      <label>电话 <span className={styles.required}>*</span></label>
                      <div className={styles.phoneInput}>
                        <select
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          className={styles.phoneCode}
                        >
                          {countryPhoneCodes.map(({ code, country }) => (
                            <option key={code} value={code}>
                              +{code} {country}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          value={contactInfo.phone}
                          onChange={handleInputChange}
                          className={formErrors.phone ? styles.errorInput : ''}
                        />
                      </div>
                      {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                    </div>

                    <div className={styles.formRow}>
                      <label>公司</label>
                      <input
                        type="text"
                        name="company"
                        value={contactInfo.company}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <label>备注</label>
                      <textarea
                        name="notes"
                        value={contactInfo.notes}
                        onChange={handleInputChange}
                        placeholder="请输入其他需要说明..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className={styles.submitSection}>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || cart.items.length === 0}
                      className={styles.submitButton}
                    >
                      {submitting ? '提交中...' : '确认样品'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* 添加订单详情模态框 */}
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  )
} 