import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { testConnection } from './db/index.js'
import { initDb } from './db/init.js'
import authRoutes from './routes/auth.routes.js'
import accountRoutes from './routes/account.routes.js'
import projectRoutes from './routes/project.routes.js'
import rbacRoutes from './routes/rbac.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5050

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistPath = path.join(__dirname, 'client', 'dist')

app.use(cors())
app.use(express.json())

// API Routes
app.get('/test', (req, res) => {
  console.log('Server is running')
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})
app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/rbac', rbacRoutes)

// Serve frontend build if dist folder exists
app.use(express.static(clientDistPath))

// Catch-all route for SPA client routing
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Client build not found. Run backend API or vite dev server.')
    }
  })
})

// Initialize DB and start server
const startServer = async () => {
  const isDbConnected = await testConnection()
  if (isDbConnected) {
    await initDb()
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Orogen API Server running on http://localhost:${PORT}`)
    })
  }
}

startServer()

export default app

