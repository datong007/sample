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
        console.log(`Port ${port} is in use, trying next port`)
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
      console.log(`> Ready on http://localhost:${port}`)
      resolve(true)
    })
  })
}

app.prepare().then(async () => {
  const ports = [3000, 3001]
  for (const port of ports) {
    try {
      const success = await startServer(port)
      if (success) break
    } catch (err) {
      console.error(`Error starting server on port ${port}:`, err)
    }
  }
}) 