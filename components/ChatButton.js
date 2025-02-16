import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/ChatButton.module.css';

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

  // 检查消息是否包含产品关键词
  const checkForProductLinks = (message) => {
    const links = [];
    Object.entries(productLinks).forEach(([keyword, url]) => {
      if (message.toLowerCase().includes(keyword.toLowerCase())) {
        links.push({
          text: `查看${keyword}`,
          url: url
        });
      }
    });
    return links;
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
    
    // 检查用户消息中的产品关键词
    const userLinks = checkForProductLinks(userMessage);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      links: userLinks
    }]);
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 检查AI回复中的产品关键词
      const assistantLinks = checkForProductLinks(data.message);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        links: assistantLinks
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