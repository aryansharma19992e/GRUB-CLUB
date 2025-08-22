const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb+srv://g1:uESdeSvyrZNunKod@cluster0.ydcfnmy.mongodb.net/grub-club?retryWrites=true&w=majority'

const deepDatabaseCheck = async () => {
  try {
    console.log('🔍 Starting deep database check...')
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ Connected to database')
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...')
    
    // 1. Count documents
    const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}))
    const User = mongoose.model('User', new mongoose.Schema({}))
    const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}))
    
    const restaurantCount = await Restaurant.countDocuments()
    const userCount = await User.countDocuments()
    const menuItemCount = await MenuItem.countDocuments()
    
    console.log(`🍕 Restaurants: ${restaurantCount}`)
    console.log(`👥 Users: ${userCount}`)
    console.log(`🍽️  Menu Items: ${menuItemCount}`)
    
    // 2. Test simple find
    console.log('\n🔍 Testing simple find...')
    const startTime1 = Date.now()
    const restaurants = await Restaurant.find({}).limit(5).lean()
    const queryTime1 = Date.now() - startTime1
    console.log(`✅ Simple find completed in ${queryTime1}ms`)
    console.log(`   Found ${restaurants.length} restaurants`)
    
    // 3. Test with projection
    console.log('\n📋 Testing with projection...')
    const startTime2 = Date.now()
    const restaurantNames = await Restaurant.find({}, { name: 1, status: 1 }).limit(10).lean()
    const queryTime2 = Date.now() - startTime2
    console.log(`✅ Projection query completed in ${queryTime2}ms`)
    console.log(`   Restaurant names: ${restaurantNames.map(r => r.name).join(', ')}`)
    
    // 4. Test aggregation
    console.log('\n📊 Testing aggregation...')
    const startTime3 = Date.now()
    const statusCounts = await Restaurant.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    const queryTime3 = Date.now() - startTime3
    console.log(`✅ Aggregation completed in ${queryTime3}ms`)
    console.log(`   Status counts:`, statusCounts)
    
    // 5. Check for any problematic documents
    console.log('\n🔍 Checking for problematic documents...')
    const problematicRestaurants = await Restaurant.find({
      $or: [
        { name: { $exists: false } },
        { ownerId: { $exists: false } },
        { name: null },
        { ownerId: null }
      ]
    })
    
    if (problematicRestaurants.length > 0) {
      console.log(`⚠️  Found ${problematicRestaurants.length} problematic restaurants`)
      problematicRestaurants.forEach(r => console.log(`   - ${r._id}: ${r.name}`))
    } else {
      console.log('✅ No problematic restaurant documents found')
    }
    
    // 6. Check indexes
    console.log('\n📚 Checking indexes...')
    const indexes = await Restaurant.collection.indexes()
    console.log(`   Found ${indexes.length} indexes`)
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
    })
    
    // 7. Test with timeout
    console.log('\n⏱️  Testing with timeout...')
    const startTime4 = Date.now()
    try {
      const result = await Promise.race([
        Restaurant.find({}).lean(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
      ])
      const queryTime4 = Date.now() - startTime4
      console.log(`✅ Query with timeout test completed in ${queryTime4}ms`)
    } catch (error) {
      console.log(`❌ Query timed out after 30 seconds`)
    }
    
    console.log('\n✅ Deep database check completed successfully!')
    
  } catch (error) {
    console.error('❌ Deep database check error:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

deepDatabaseCheck() 