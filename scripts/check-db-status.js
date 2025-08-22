const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb+srv://g1:uESdeSvyrZNunKod@cluster0.ydcfnmy.mongodb.net/grub-club?retryWrites=true&w=majority'

const checkDatabaseStatus = async () => {
  try {
    console.log('🔍 Checking database status...')
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database')
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(`📊 Found ${collections.length} collections:`)
    collections.forEach(col => console.log(`   - ${col.name}`))
    
    // Check restaurant collection specifically
    const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}))
    const restaurantCount = await Restaurant.countDocuments()
    console.log(`🍕 Restaurants: ${restaurantCount}`)
    
    // Check user collection
    const User = mongoose.model('User', new mongoose.Schema({}))
    const userCount = await User.countDocuments()
    console.log(`👥 Users: ${userCount}`)
    
    // Test a simple query
    console.log('🧪 Testing simple query...')
    const startTime = Date.now()
    const testResult = await Restaurant.find({}).limit(1).lean()
    const queryTime = Date.now() - startTime
    console.log(`✅ Simple query completed in ${queryTime}ms`)
    
    // Check database stats
    const stats = await mongoose.connection.db.stats()
    console.log(`💾 Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📄 Total documents: ${stats.objects}`)
    
  } catch (error) {
    console.error('❌ Database check error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

checkDatabaseStatus() 