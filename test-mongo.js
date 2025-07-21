const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testMongoConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📡 Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in environment variables');
      return;
    }

    // Test connection with detailed error handling
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test creating a simple document
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    console.log('✅ Test document created:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 This is a network error. Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Add your IP address to MongoDB Atlas whitelist');
      console.log('3. Use 0.0.0.0/0 to allow all IPs (for development)');
    } else if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Server selection error. Check:');
      console.log('1. Connection string format');
      console.log('2. Network connectivity');
      console.log('3. MongoDB Atlas cluster status');
    } else if (error.name === 'MongoParseError') {
      console.log('\n💡 Connection string parsing error. Check:');
      console.log('1. Connection string format');
      console.log('2. Special characters in password');
    }
  }
}

testMongoConnection(); 