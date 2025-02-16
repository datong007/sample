const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${port} 已被占用，尝试下一个端口`)
        resolve(false)
      } else {
        reject(err)
      }
    })

    server.listen(port, (err) => {
      if (err) {
        reject(err)
        return
      }
      console.log(`> 服务器已启动: http://localhost:${port}`)
      resolve(true)
    })
  })
}

const findAvailablePort = async (startPort, maxAttempts = 10) => {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    try {
      const success = await startServer(port)
      if (success) return true
    } catch (err) {
      console.error(`启动端口 ${port} 失败:`, err.message)
    }
  }
  return false
}

app.prepare()
  .then(async () => {
    const success = await findAvailablePort(3000)
    if (!success) {
      console.error('无法找到可用端口，请检查端口占用情况或手动指定端口')
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error('启动服务器时发生错误:', err)
    process.exit(1)
  }) 