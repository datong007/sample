import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/ChatButton.module.css';
import { productData } from '../data/products';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 定义产品推荐链接
  const productLinks = {
    "样品": "/products",
    "产品": "/products",
    "订单": "/orders",
    "样品单": "/sample-list",
    // 可以添加更多产品关键词和对应链接
  };

  // 修改产品链接生成逻辑
  const generateProductLink = (productId) => {
    return `/products#product-${productId}`;
  };

  // 检查消息中的产品引用并返回产品信息
  const checkForProductInfo = (message) => {
    const links = [];
    const productInfo = [];
    
    // 支持多种ID格式，添加全局标志g
    const idPatterns = [
      /(?:产品ID:|#)([A-Z0-9]+-\d{3})/gi,  // 完整ID格式 (如 #A2325C-001)
      /(?:型号:|#)([A-Z0-9]+)/gi,           // 仅型号格式 (如 #A2325C)
    ];

    for (const pattern of idPatterns) {
      const matches = [...message.matchAll(pattern)];
      for (const match of matches) {
        const id = match[1];
        // 查找完整产品ID
        const productId = Object.keys(productData).find(key => 
          key.includes(id) || productData[key].model.includes(id)
        );

        if (productId && productData[productId]) {
          const product = productData[productId];
          links.push({
            text: `查看产品 ${product.model}`,
            url: generateProductLink(productId)
          });

          productInfo.push(`
产品信息：
- 产品ID：${product.productId}
- 名称：${product.name}
- 型号：${product.model}
- 材质：${product.material}
- 尺寸：${product.dimensions}
- 克重：${product.weight}
${product.description ? `- 描述：${product.description}` : ''}`);
        }
      }
    }

    return { links, productInfo };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '您好！我是样品管理助手，很高兴为您服务。请问有什么可以帮您的吗？',
          links: [
            { text: '浏览样品', url: '/products' },
            { text: '我的样品单', url: '/sample-list' }
          ]
        }
      ]);
    }
    scrollToBottom();
  }, [isOpen, messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 检查用户消息中的产品信息
    const { links: userLinks } = checkForProductInfo(userMessage);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      links: userLinks
    }]);
    
    setIsLoading(true);

    try {
      // 将产品数据转换为格式化的字符串
      const productContext = Object.entries(productData).map(([id, product]) => `
## ${product.name}
*   **产品ID：** ${product.productId}
*   **名称：** ${product.name}
*   **型号：** ${product.model}
*   **材质：** ${product.material}
*   **尺寸：** ${product.dimensions}
*   **克重：** ${product.weight}
*   **描述：** ${product.description}
`).join('\n');

      // 合并用户消息和产品上下文
      const messageWithContext = `
用户问题: ${userMessage}

----
产品数据库:
${productContext}
----

请根据以上产品数据库信息回答用户问题。回答要简洁明了，如果问题中提到了具体产品，要包含产品的具体信息。`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageWithContext }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 检查AI回复中的产品信息
      const { links: assistantLinks, productInfo } = checkForProductInfo(data.message);
      
      // 如果找到产品信息，将其添加到回复中
      const enhancedMessage = productInfo.length > 0 
        ? `${data.message}\n\n${productInfo.join('\n\n')}`
        : data.message;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: enhancedMessage,
        links: assistantLinks
      }]);

      // 如果回复中包含产品链接，自动跳转到第一个产品
      if (assistantLinks && assistantLinks.length > 0) {
        const firstProductLink = assistantLinks[0];
        // 使用 window.location.href 进行跳转，这样可以触发产品高亮效果
        window.location.href = firstProductLink.url;
      }
    } catch (error) {
      console.error('聊天出错:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我暂时无法回答您的问题。请稍后再试或换个问题。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <button 
        className={styles.chatButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '关闭聊天' : '智能助手'}
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div key={index}>
                <div className={`${styles.message} ${styles[msg.role]}`}>
                  {msg.content}
                </div>
                {msg.links && msg.links.length > 0 && (
                  <div className={styles.linkButtons}>
                    {msg.links.map((link, linkIndex) => (
                      <Link 
                        key={linkIndex} 
                        href={link.url}
                        className={styles.linkButton}
                      >
                        {link.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={styles.loading}>正在思考...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入您的问题..."
              className={styles.input}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={styles.sendButton}
            >
              发送
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 