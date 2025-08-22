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
  createdAt: Date,
}, { _id: false })

const User = mongoose.model('User', userSchema)
const Restaurant = mongoose.model('Restaurant', restaurantSchema)

const adminUtils = {
  // List all restaurants with owner information
  async listRestaurants() {
    console.log('📋 Listing all restaurants...')
    const restaurants = await Restaurant.find({}).sort({ createdAt: -1 })
    
    for (const restaurant of restaurants) {
      try {
        const owner = await User.findById(restaurant.ownerId)
        const status = owner ? '✅ Valid' : '❌ Orphaned'
        console.log(`${status} | ${restaurant.name} | Owner: ${owner ? owner.name : 'DELETED USER'} | Status: ${restaurant.status}`)
      } catch (error) {
        console.log(`❌ Orphaned | ${restaurant.name} | Owner: INVALID REFERENCE | Status: ${restaurant.status}`)
      }
    }
  },

  // Find orphaned restaurants
  async findOrphaned() {
    console.log('🔍 Finding orphaned restaurants...')
    const restaurants = await Restaurant.find({})
    const orphaned = []
    
    for (const restaurant of restaurants) {
      try {
        const owner = await User.findById(restaurant.ownerId)
        if (!owner) {
          orphaned.push(restaurant)
        }
      } catch (error) {
        orphaned.push(restaurant)
      }
    }
    
    if (orphaned.length === 0) {
      console.log('✅ No orphaned restaurants found')
      return []
    }
    
    console.log(`❌ Found ${orphaned.length} orphaned restaurants:`)
    orphaned.forEach(restaurant => {
      console.log(`   - ${restaurant.name} (ID: ${restaurant._id})`)
      console.log(`     Owner ID: ${restaurant.ownerId}`)
      console.log(`     Status: ${restaurant.status}`)
      console.log(`     Created: ${restaurant.createdAt}`)
      console.log('')
    })
    
    return orphaned
  },

  // Clean up orphaned restaurants
  async cleanupOrphaned() {
    console.log('🧹 Cleaning up orphaned restaurants...')
    const orphaned = await this.findOrphaned()
    
    if (orphaned.length === 0) {
      console.log('✅ No cleanup needed')
      return
    }
    
    console.log(`\n⚠️  About to delete ${orphaned.length} orphaned restaurants`)
    console.log('This action cannot be undone!')
    
    // In a real scenario, you might want to add confirmation here
    // For now, we'll just log what would be deleted
    
    let deletedCount = 0
    for (const restaurant of orphaned) {
      console.log(`🗑️  Would delete: ${restaurant.name}`)
      // Uncomment the next line to actually delete
      await Restaurant.findByIdAndDelete(restaurant._id)
      console.log(`   ✅ Deleted orphaned restaurant: ${restaurant.name}`)
      deletedCount++
    }
    
    console.log('\n💡 To actually delete, uncomment the deletion line in this script')
  },

  // Reassign orphaned restaurant to a new owner
  async reassignOrphaned(restaurantId, newOwnerId) {
    console.log(`🔄 Reassigning restaurant ${restaurantId} to owner ${newOwnerId}...`)
    
    try {
      // Verify new owner exists
      const newOwner = await User.findById(newOwnerId)
      if (!newOwner) {
        throw new Error('New owner not found')
      }
      
      // Update restaurant owner
      const result = await Restaurant.findByIdAndUpdate(
        restaurantId,
        { ownerId: newOwnerId },
        { new: true }
      )
      
      if (result) {
        console.log(`✅ Restaurant ${result.name} reassigned to ${newOwner.name}`)
        return result
      } else {
        throw new Error('Restaurant not found')
      }
    } catch (error) {
      console.error(`❌ Failed to reassign restaurant: ${error.message}`)
      throw error
    }
  }
}

// Main function
const main = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database')
    
    const command = process.argv[2]
    
    switch (command) {
      case 'list':
        await adminUtils.listRestaurants()
        break
      case 'find-orphaned':
        await adminUtils.findOrphaned()
        break
      case 'cleanup':
        await adminUtils.cleanupOrphaned()
        break
      case 'reassign':
        const restaurantId = process.argv[3]
        const newOwnerId = process.argv[4]
        if (!restaurantId || !newOwnerId) {
          console.log('Usage: node admin-utils.js reassign <restaurantId> <newOwnerId>')
          break
        }
        await adminUtils.reassignOrphaned(restaurantId, newOwnerId)
        break
      default:
        console.log('Available commands:')
        console.log('  list           - List all restaurants with owner info')
        console.log('  find-orphaned  - Find orphaned restaurants')
        console.log('  cleanup        - Clean up orphaned restaurants (dry run)')
        console.log('  reassign <id> <ownerId> - Reassign restaurant to new owner')
        console.log('\nExample: node admin-utils.js list')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = adminUtils 