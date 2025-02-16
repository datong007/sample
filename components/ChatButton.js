import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/ChatButton.module.css';

// 产品信息数据
const productData = {
  "鱼竿1": {
    "名称": "渔夫之选 超硬调鲫鱼竿",
    "类型": "鲫鱼竿",
    "材质": "高密度碳素",
    "长度": "3.6米",
    "调性": "超硬调",
    "适用鱼种": "鲫鱼、鲤鱼等小型鱼类",
    "特点": [
      "轻巧便携，手感舒适",
      "腰力强劲，轻松应对大鱼",
      "灵敏度高，快速传递鱼讯"
    ],
    "价格": "199元"
  },
  "鱼竿2": {
    "名称": "海钓之家 远投抛竿",
    "类型": "海竿",
    "材质": "玻璃钢",
    "长度": "2.4米",
    "调性": "中硬调",
    "适用鱼种": "海鱼、鲈鱼等中大型鱼类",
    "特点": [
      "坚固耐用，抗腐蚀性强",
      "远投能力出色，轻松到达钓点",
      "配有防缠绕导环，减少线组缠绕"
    ],
    "价格": "268元"
  }
};

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
    "鱼竿": "/products",
    // 可以添加更多产品关键词和对应链接
  };

  // 检查消息是否包含产品关键词和产品信息
  const checkForProductLinks = (message) => {
    const links = [];
    const productInfo = [];

    // 检查是否包含产品关键词
    Object.entries(productLinks).forEach(([keyword, url]) => {
      if (message.toLowerCase().includes(keyword.toLowerCase())) {
        links.push({
          text: `查看${keyword}`,
          url: url
        });
      }
    });

    // 检查是否包含具体产品信息
    Object.entries(productData).forEach(([key, data]) => {
      if (message.toLowerCase().includes(data.名称.toLowerCase()) || 
          message.toLowerCase().includes(data.类型.toLowerCase())) {
        const info = `${data.名称}\n类型：${data.类型}\n材质：${data.材质}\n长度：${data.长度}\n调性：${data.调性}\n适用鱼种：${data.适用鱼种}\n特点：\n${data.特点.map(t => `- ${t}`).join('\n')}\n价格：${data.价格}`;
        productInfo.push(info);
      }
    });

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
    
    // 创建包含产品数据的上下文消息
    const contextMessage = `系统上下文信息：${JSON.stringify(productData)}\n用户问题：${userMessage}`;
    
    // 检查用户消息中的产品关键词
    const { links, productInfo } = checkForProductLinks(userMessage);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,  // 显示给用户看的仍然是原始消息
      links: links
    }]);
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextMessage }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 检查AI回复中的产品关键词
      const { links: assistantLinks, productInfo: assistantProductInfo } = checkForProductLinks(data.message);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        links: assistantLinks,
        productInfo: assistantProductInfo
      }]);
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
                  {msg.productInfo && msg.productInfo.map((info, infoIndex) => (
                    <pre key={infoIndex} className={styles.productInfo}>
                      {info}
                    </pre>
                  ))}
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