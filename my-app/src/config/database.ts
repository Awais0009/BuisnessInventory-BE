import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

// Function to set current user context for RLS
export const setCurrentUser = async (userId: string) => {
  const client = await pool.connect();
  try {
    await client.query(`SET app.current_user_id = $1`, [userId]);
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
};

// Function to execute query with automatic user context
export const queryWithUser = async (userId: string, text: string, params?: any[]) => {
  const client = await setCurrentUser(userId);
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Regular query function
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Get a client from the pool
export const getClient = () => {
  return pool.connect();
};

export default pool;
