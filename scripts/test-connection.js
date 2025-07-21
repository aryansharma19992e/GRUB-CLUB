const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Test MongoDB connection
const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB connection...')
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grub-club'
    console.log('🔗 Using URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'))
    
    // Try to connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    })
    
    console.log('✅ Successfully connected to MongoDB!')
    console.log('📊 Database: grub-club')
    
    // Test creating a simple document
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }))
    const testDoc = await TestModel.create({ name: 'test' })
    console.log('✅ Successfully created test document:', testDoc._id)
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id })
    console.log('✅ Successfully deleted test document')
    
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    console.log('🎉 Database connection test PASSED!')
    
  } catch (error) {
    console.log('❌ Failed to connect to MongoDB')
    console.log('Error:', error.message)
    console.log('\n📋 To fix this:')
    console.log('1. Check your MongoDB Atlas connection string')
    console.log('2. Make sure your IP is whitelisted in MongoDB Atlas')
    console.log('3. Verify your username and password are correct')
  }
}

testConnection() 