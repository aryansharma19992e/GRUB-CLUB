require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Simple schemas for quick seeding
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['user', 'restaurant_owner', 'admin'], default: 'user' },
  address: String,
  restaurantName: String,
}, { timestamps: true })

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
  status: { type: String, default: 'approved' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  openingHours: String,
  isOpen: { type: Boolean, default: true },
  minimumOrder: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true })

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  spiceLevel: { type: String, default: 'Mild' },
  preparationTime: String,
  calories: Number,
  allergens: [String],
  ingredients: [String],
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Restaurant = mongoose.model('Restaurant', restaurantSchema)
const MenuItem = mongoose.model('MenuItem', menuItemSchema)

const quickSeed = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...')
    const MONGODB_URI = process.env.MONGODB_URI
    console.log('🔗 Using URI:', MONGODB_URI?.substring(0, 50) + '...')
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB!')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Restaurant.deleteMany({})
    await MenuItem.deleteMany({})
    console.log('✅ Cleared existing data')

    // Create admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@grubclub.com',
      password: hashedPassword,
      phone: '+91 9876543210',
      role: 'admin'
    })
    console.log('✅ Created admin user:', adminUser.email)

    // Create restaurant owner
    console.log('👨‍🍳 Creating restaurant owner...')
    const ownerPassword = await bcrypt.hash('owner123', 12)
    const restaurantOwner = await User.create({
      name: 'Restaurant Owner',
      email: 'owner@restaurant.com',
      password: ownerPassword,
      phone: '+91 9876543211',
      role: 'restaurant_owner',
      restaurantName: 'Spice Garden'
    })
    console.log('✅ Created restaurant owner:', restaurantOwner.email)

    // Create regular user
    console.log('👤 Creating regular user...')
    const userPassword = await bcrypt.hash('user123', 12)
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      phone: '+91 9876543212',
      role: 'user'
    })
    console.log('✅ Created regular user:', regularUser.email)

    // Create restaurant
    console.log('🏪 Creating restaurant...')
    const restaurant = await Restaurant.create({
      name: 'Spice Garden',
      description: 'Authentic Indian cuisine with modern twists',
      cuisine: 'Indian',
      address: '123 Main Street, Patiala',
      phone: '+91 9876543211',
      email: 'info@spicegarden.com',
      deliveryTime: '30-45 min',
      distance: '2.5 km',
      priceRange: '₹₹',
      tags: ['North Indian', 'Vegetarian', 'Spicy'],
      status: 'approved',
      ownerId: restaurantOwner._id,
      openingHours: '11:00 AM - 11:00 PM',
      isOpen: true,
      minimumOrder: 200,
      deliveryFee: 50,
      coordinates: {
        latitude: 30.3398,
        longitude: 76.3869
      },
      rating: 4.5,
      totalReviews: 25
    })
    console.log('✅ Created restaurant:', restaurant.name)

    // Create menu items
    console.log('🍽️  Creating menu items...')
    const menuItems = await MenuItem.create([
      {
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken',
        price: 350,
        category: 'Main Course',
        isAvailable: true,
        isVegetarian: false,
        spiceLevel: 'Medium',
        preparationTime: '20 min',
        calories: 450,
        allergens: ['Dairy'],
        ingredients: ['Chicken', 'Tomato', 'Cream', 'Butter', 'Spices'],
        restaurantId: restaurant._id,
        order: 1
      },
      {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with Indian spices',
        price: 280,
        category: 'Appetizer',
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 'Medium',
        preparationTime: '15 min',
        calories: 320,
        allergens: ['Dairy'],
        ingredients: ['Paneer', 'Yogurt', 'Spices', 'Onion', 'Bell Pepper'],
        restaurantId: restaurant._id,
        order: 2
      },
      {
        name: 'Biryani',
        description: 'Fragrant rice dish with aromatic spices',
        price: 400,
        category: 'Main Course',
        isAvailable: true,
        isVegetarian: false,
        spiceLevel: 'Hot',
        preparationTime: '30 min',
        calories: 550,
        allergens: [],
        ingredients: ['Rice', 'Chicken', 'Spices', 'Saffron', 'Herbs'],
        restaurantId: restaurant._id,
        order: 3
      }
    ])
    console.log('✅ Created', menuItems.length, 'menu items')

    console.log('🎉 Database seeded successfully!')
    console.log('\n📋 Test Accounts:')
    console.log('Admin: admin@grubclub.com / admin123')
    console.log('Owner: owner@restaurant.com / owner123')
    console.log('User: john@example.com / user123')

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')

  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 Network error - check your MongoDB Atlas IP whitelist')
      console.log('🔧 Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere')
    }
  }
}

quickSeed() 