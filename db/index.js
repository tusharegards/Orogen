import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'orogen_db',
    }

export const pool = new Pool(connectionConfig)

// Helper function to test DB connection
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('✅ PostgreSQL database connected successfully.')
    client.release()
    return true
  } catch (err) {
    console.error('⚠️ PostgreSQL connection failed:', err.message)
    console.error('👉 Make sure PostgreSQL service is running and credentials in .env are correct.')
    return false
  }
}

export const query = (text, params) => pool.query(text, params)
