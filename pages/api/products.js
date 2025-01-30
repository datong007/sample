import { addProduct, getProducts } from '../../data/products'
import { initializeStock } from '../../lib/db'

const products = [
  { 
    id: 1, 
    name: '高性能防水面料', 
    model: 'WP-001',
    description: '采用先进纳米技术的防水面料，适用于户外运动服装',
    specs: {
      材料: '纳米防水面料',
      尺寸: '宽幅: 150cm/180cm',
      克重: '150g/m² - 200g/m²',
      颜色: '深蓝/黑色/军绿'
    },
    stock: 15,
    category: '功能面料',
    image: '/images/fabric-1.jpg',
    variants: {
      '颜色': ['深蓝', '黑色', '军绿'],
      '克重': ['150g/m²', '200g/m²'],
      '宽幅': ['150cm', '180cm']
    }
  },
  { 
    id: 2, 
    name: '弹力运动面料',
    model: 'SP-002',
    description: '四向弹力，速干透气，适合运动服装和瑜伽服',
    specs: {
      材料: '弹力速干面料',
      尺寸: '宽幅: 150cm',
      克重: '160g/m² - 180g/m²',
      特点: '四向弹力'
    },
    stock: 20,
    category: '运动面料',
    image: '/images/fabric-2.jpg',
    variants: {
      '颜色': ['黑色', '白色', '灰色'],
      '克重': ['160g/m²', '180g/m²'],
      '弹力': ['2-way', '4-way']
    }
  },
  { 
    id: 3, 
    name: '有机棉针织布',
    model: 'OC-003',
    description: '100%有机棉，环保认证，适合婴童服装',
    stock: 25,
    category: '天然面料',
    image: '/images/fabric-3.jpg',
    variants: {
      '颜色': ['本白', '米白', '浅灰'],
      '克重': ['140g/m²', '180g/m²'],
      '织法': ['单面', '双面']
    }
  },
  {
    id: 4,
    name: '抗菌防护面料',
    model: 'AB-004',
    description: '添加抗菌防护层，适用于医疗防护服装',
    stock: 30,
    category: '功能面料',
    image: '/images/fabric-4.jpg',
    variants: {
      '颜色': ['白色', '浅蓝', '粉色'],
      '克重': ['120g/m²', '150g/m²'],
      '防护等级': ['Level 1', 'Level 2', 'Level 3']
    }
  },
  {
    id: 5,
    name: '仿麂皮绒面料',
    model: 'SD-005',
    description: '超柔软仿麂皮绒，适用于家居服和玩具',
    stock: 18,
    category: '装饰面料',
    image: '/images/fabric-5.jpg',
    variants: {
      '颜色': ['驼色', '粉色', '灰色'],
      '克重': ['220g/m²', '250g/m²'],
      '起毛高度': ['1mm', '2mm']
    }
  },
  {
    id: 6,
    name: '再生环保面料',
    model: 'RC-006',
    description: '由回收塑料瓶制成的环保面料，适合休闲服装',
    stock: 22,
    category: '环保面料',
    image: '/images/fabric-6.jpg',
    variants: {
      '颜色': ['深绿', '海蓝', '石灰'],
      '克重': ['130g/m²', '160g/m²'],
      '成分': ['100%再生', '混纺']
    }
  },
  {
    id: 7,
    name: '保暖抓绒面料',
    model: 'FL-007',
    description: '双面抓绒保暖面料，适用于冬季外套',
    stock: 12,
    category: '保暖面料',
    image: '/images/fabric-7.jpg',
    variants: {
      '颜色': ['黑色', '藏青', '酒红'],
      '克重': ['200g/m²', '280g/m²'],
      '起绒工艺': ['单面', '双面']
    }
  },
  {
    id: 8,
    name: '轻薄防晒面料',
    model: 'UV-008',
    description: 'UPF50+防晒面料，适合夏季防晒服',
    stock: 28,
    category: '功能面料',
    image: '/images/fabric-8.jpg',
    variants: {
      '颜色': ['白色', '米色', '淡蓝'],
      '克重': ['90g/m²', '110g/m²'],
      'UPF等级': ['30+', '40+', '50+']
    }
  },
  {
    id: 9,
    name: '蜂窝网眼布',
    model: 'HM-009',
    description: '运动面料，高透气性，适合运动服装',
    stock: 16,
    category: '运动面料',
    image: '/images/fabric-9.jpg',
    variants: {
      '颜色': ['白色', '黑色', '荧光黄'],
      '克重': ['125g/m²', '160g/m²'],
      '网眼大小': ['小', '中', '大']
    }
  },
  {
    id: 10,
    name: '仿丝绸面料',
    model: 'SK-010',
    description: '柔滑仿真丝面料，适合时装和衬衫',
    stock: 20,
    category: '时装面料',
    image: '/images/fabric-10.jpg',
    variants: {
      '颜色': ['珍珠白', '香槟金', '玫瑰粉'],
      '克重': ['80g/m²', '100g/m²'],
      '光泽': ['亮光', '哑光']
    }
  }
]

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      initializeStock(products)
      res.status(200).json({ products })
    } else {
      res.status(405).json({ 
        success: false, 
        message: '方法不允许',
        error: 'Method not allowed'
      })
    }
  } catch (error) {
    console.error('API错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: error.message 
    })
  }
} 