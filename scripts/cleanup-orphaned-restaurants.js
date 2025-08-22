const mongoose = require('mongoose')

// MongoDB connection - using the actual MongoDB Atlas URI
const MONGODB_URI = 'mongodb+srv://g1:uESdeSvyrZNunKod@cluster0.ydcfnmy.mongodb.net/grub-club?retryWrites=true&w=majority'

// Define schemas
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  role: String,
}, { _id: false })

const restaurantSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  status: String,
}, { _id: false })

const User = mongoose.model('User', userSchema)
const Restaurant = mongoose.model('Restaurant', restaurantSchema)

const cleanupOrphanedRestaurants = async () => {
  try {
    console.log('🔍 Starting cleanup of orphaned restaurants...')
    
    // Connect to database
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database')
    
    // Get all restaurants
    const restaurants = await Restaurant.find({})
    console.log(`📊 Found ${restaurants.length} restaurants`)
    
    let orphanedCount = 0
    let deletedCount = 0
    
    for (const restaurant of restaurants) {
      try {
        // Check if owner exists
        const owner = await User.findById(restaurant.ownerId)
        
        if (!owner) {
          console.log(`❌ Orphaned restaurant found: ${restaurant.name} (ID: ${restaurant._id})`)
          console.log(`   Owner ID: ${restaurant.ownerId} (not found in users)`)
          orphanedCount++
          
          // Ask for confirmation before deletion
          console.log(`   Status: ${restaurant.status}`)
          console.log(`   Created: ${restaurant.createdAt || 'Unknown'}`)
          
          // You can uncomment the next line to automatically delete orphaned restaurants
          // await Restaurant.findByIdAndDelete(restaurant._id)
          // console.log(`   ✅ Deleted orphaned restaurant: ${restaurant.name}`)
          // deletedCount++
        }
      } catch (error) {
        console.log(`⚠️  Error checking restaurant ${restaurant.name}:`, error.message)
      }
    }
    
    console.log('\n📋 Cleanup Summary:')
    console.log(`   Total restaurants: ${restaurants.length}`)
    console.log(`   Orphaned restaurants: ${orphanedCount}`)
    console.log(`   Deleted restaurants: ${deletedCount}`)
    
    if (orphanedCount > 0) {
      console.log('\n💡 To automatically delete orphaned restaurants:')
      console.log('   1. Review the orphaned restaurants above')
      console.log('   2. Uncomment the deletion line in this script')
      console.log('   3. Run the script again')
    }
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Run cleanup
cleanupOrphanedRestaurants() 