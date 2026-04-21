import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDistPath = path.join(__dirname, 'client', 'dist')

app.use(express.json())
app.use(express.static(clientDistPath))

// Keep API routes above this catch-all so client-side routing
// does not intercept backend endpoints.
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
