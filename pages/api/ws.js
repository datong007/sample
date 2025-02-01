import { Server } from 'ws'
import { jwtVerify } from 'jose'
import { parse } from 'cookie'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

const wss = new Server({ noServer: true })

wss.on('connection', async (ws, req) => {
  ws.isAdmin = false

  try {
    const cookieHeader = req.headers.cookie || ''
    const cookies = parse(cookieHeader)
    const token = cookies.auth

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        ws.isAdmin = payload.role === 'admin'
      } catch (error) {
        console.error('WebSocket token verification failed:', error)
      }
    }
  } catch (error) {
    console.error('WebSocket cookie parsing failed:', error)
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