import { Server } from 'ws'
import { jwtVerify } from 'jose'
import { parse } from 'cookie'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

const wss = new Server({ noServer: true })

wss.on('connection', (ws) => {
  console.log('New client connected')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      // 处理接收到的消息
      console.log('Received:', data)
      
      // 广播消息给所有客户端
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(JSON.stringify(data))
        }
      })
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
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