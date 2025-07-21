import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true
    }

    console.log('🔍 Attempting to connect to MongoDB...')
    console.log('📡 Connection string:', MONGODB_URI?.substring(0, 50) + '...')

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB successfully!')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message)
      if (error.name === 'MongoNetworkError') {
        console.log('💡 Network error - check your internet connection and MongoDB Atlas settings')
        console.log('🔧 Make sure your IP address is whitelisted in MongoDB Atlas')
      } else if (error.name === 'MongoServerSelectionError') {
        console.log('💡 Server selection error - check your connection string and network')
      }
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ Failed to connect to MongoDB:', e)
    throw e
  }

  return cached.conn
}

export default dbConnect 