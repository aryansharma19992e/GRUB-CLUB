const mongoose = require('mongoose')

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://g1:uESdeSvyrZNunKod@cluster0.ydcfnmy.mongodb.net/grub-club?retryWrites=true&w=majority'

// Restaurant schema
const restaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  cuisine: String,
  address: String,
  phone: String,
  email: String,
  deliveryTime: String,
  distance: String,
  priceRange: String,
  tags: [String],
  status: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  openingHours: String,
  isOpen: Boolean,
  minimumOrder: Number,
  deliveryFee: Number,
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  rating: Number,
  totalReviews: Number,
}, { timestamps: true })

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

const updateRestaurantDescriptions = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database')

    // Update restaurant descriptions with proper content
    const updates = [
      {
        name: 'pizza nation',
        description: 'Authentic Italian pizzas with fresh ingredients and traditional recipes. From classic Margherita to loaded farmhouse pizzas, we serve the best pizza experience in town.'
      },
      {
        name: 'sips and bites',
        description: 'A cozy café serving delicious beverages, snacks, and light meals. Perfect for coffee lovers and those seeking a relaxing dining experience with quality food.'
      },
      {
        name: 'Wrapchik',
        description: 'Fresh and flavorful wraps made with premium ingredients. From classic chicken wraps to vegetarian options, we offer quick, healthy, and delicious meals on the go.'
      },
      {
        name: 'dessert club',
        description: 'Sweet paradise offering a wide variety of desserts, pastries, and confections. From traditional Indian sweets to international desserts, satisfy your sweet tooth with our premium quality treats.'
      },
      {
        name: 'chilli chatkara',
        description: 'Authentic Indian street food and chaat specialties. Experience the burst of flavors with our spicy, tangy, and delicious chaat items that bring the true taste of Indian street cuisine.'
      }
    ]

    for (const update of updates) {
      const result = await Restaurant.findOneAndUpdate(
        { name: update.name },
        { description: update.description },
        { new: true }
      )
      
      if (result) {
        console.log(`✅ Updated: ${update.name}`)
        console.log(`   New description: ${update.description}`)
      } else {
        console.log(`❌ Not found: ${update.name}`)
      }
    }

    console.log('\n🎉 Restaurant descriptions updated successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from database')
  }
}

updateRestaurantDescriptions() 