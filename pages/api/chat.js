import { NextResponse } from 'next/server'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  if (!process.env.SILICONFLOW_API_KEY) {
    console.error('未配置 SILICONFLOW_API_KEY');
    return res.status(500).json({ 
      message: '系统配置错误，请联系管理员'
    });
  }

  try {
    const { message } = req.body;
    
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
          },
          body: JSON.stringify({
            model: "THUDM/glm-4-9b-chat",
            messages: [
              {
                role: "system",
                content: "你是一个专业的样品管理助手，可以帮助用户解答关于样品管理系统的问题。请使用中文回答，回答要简洁专业。"
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 512,
            stream: false
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API 响应错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('API 返回数据格式错误');
        }

        return res.status(200).json({
          message: data.choices[0].message.content,
        });

      } catch (error) {
        console.error(`重试 ${retryCount + 1}/${maxRetries}:`, error);
        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      message: '抱歉，暂时无法处理您的请求，请稍后重试。',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 