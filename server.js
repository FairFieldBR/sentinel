import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isProduction = process.env.NODE_ENV === 'production' || process.env.PASSENGER_APP_ENV === 'production'

if (!isProduction) {
  console.error('server.js é somente para produção. Use NODE_ENV=production no Passenger.')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const app = express()
const port = process.env.PORT || 3000

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sentinel-frontend' })
})

app.use(express.static(distDir, {
  index: false,
  maxAge: '1y',
}))

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API externa ao frontend' })
  }
  next()
})

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`[SENTINEL] Frontend production rodando na porta ${port}`)
})
