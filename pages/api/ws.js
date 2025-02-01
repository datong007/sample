import { Server } from 'ws'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

const wss = new Server({ noServer: true })

wss.on('connection', (ws, req) => {
  ws.isAdmin = false

  // 验证管理员身份
  const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {})

  if (cookies?.adminToken) {
    try {
      jwtVerify(cookies.adminToken, JWT_SECRET)
        .then(() => {
          ws.isAdmin = true
        })
        .catch(console.error)
    }
  }

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message)
      // 广播订单状态更新
      if (data.type === 'ORDER_STATUS_UPDATE') {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data))
          }
        })
      }
    } catch (error) {
      console.error('WebSocket 消息处理错误:', error)
    }
  })
})

export default function handler(req, res) {
  if (!res.socket.server.ws) {
    res.socket.server.ws = wss
  }

  res.socket.server.ws.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    res.socket.server.ws.emit('connection', ws, req)
  })
} 