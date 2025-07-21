const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📡 Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in environment variables');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ MongoDB connected successfully!');
    
    // Test if we can access the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.name === 'MongoNetworkError') {
      console.log('💡 This might be a network issue or incorrect connection string');
    }
  }
}

testConnection(); 