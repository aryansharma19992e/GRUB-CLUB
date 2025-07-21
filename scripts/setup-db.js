require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection - you'll need to update this with your MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grub-club'

// Define schemas directly in this file
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'restaurant_owner', 'admin'], default: 'user' },
  address: { type: String },
  restaurantName: { type: String },
}, { timestamps: true })

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cuisine: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  distance: { type: String, required: true },
  priceRange: { type: String, enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'], required: true },
  tags: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  openingHours: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  minimumOrder: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true })

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Hot', 'Extra Hot'], default: 'Mild' },
  preparationTime: { type: String, required: true },
  calories: { type: Number },
  allergens: [String],
  ingredients: [String],
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const restaurantTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['cuisine', 'dietary', 'service', 'atmosphere', 'price', 'location'], required: true },
  icon: { type: String },
  color: { type: String },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    specialInstructions: { type: String },
    totalPrice: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'wallet'], required: true },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  deliveryInstructions: { type: String },
  estimatedDeliveryTime: { type: Date, required: true },
  actualDeliveryTime: { type: Date },
  orderTime: { type: Date, default: Date.now },
  preparationTime: { type: Date },
  readyTime: { type: Date },
  outForDeliveryTime: { type: Date },
  cancelledAt: { type: Date },
  cancelledBy: { type: String, enum: ['user', 'restaurant', 'admin'] },
  cancellationReason: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
}, { timestamps: true })

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  foodRating: { type: Number, required: true, min: 1, max: 5 },
  serviceRating: { type: Number, required: true, min: 1, max: 5 },
  deliveryRating: { type: Number, required: true, min: 1, max: 5 },
  valueRating: { type: Number, required: true, min: 1, max: 5 },
  images: [String],
  isVerified: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  reportedCount: { type: Number, default: 0 },
  isReported: { type: Boolean, default: false },
  reportedReason: { type: String },
}, { timestamps: true })

// Create models
const User = mongoose.model('User', userSchema)
const Restaurant = mongoose.model('Restaurant', restaurantSchema)
const MenuItem = mongoose.model('MenuItem', menuItemSchema)
const RestaurantTag = mongoose.model('RestaurantTag', restaurantTagSchema)
const Order = mongoose.model('Order', orderSchema)
const Review = mongoose.model('Review', reviewSchema)

const setupDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')

    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Restaurant.deleteMany({})
    await MenuItem.deleteMany({})
    await RestaurantTag.deleteMany({})
    await Order.deleteMany({})
    await Review.deleteMany({})
    console.log('✅ Cleared existing data')

    console.log('🏷️  Creating restaurant tags...')
    const tags = await RestaurantTag.create([
      {
        name: 'North Indian',
        description: 'Traditional North Indian cuisine with rich flavors and spices',
        category: 'cuisine',
        icon: '🍛',
        color: '#FF6B35',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'South Indian',
        description: 'Authentic South Indian dishes with rice and lentils',
        category: 'cuisine',
        icon: '🍚',
        color: '#F7931E',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Italian',
        description: 'Classic Italian dishes with pasta and pizza',
        category: 'cuisine',
        icon: '🍕',
        color: '#D4145A',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Fast Food',
        description: 'Quick and convenient fast food options',
        category: 'cuisine',
        icon: '🍔',
        color: '#FFA500',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Vegetarian',
        description: 'Plant-based dishes without meat',
        category: 'dietary',
        icon: '🥬',
        color: '#4CAF50',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Vegan',
        description: 'Completely plant-based dishes',
        category: 'dietary',
        icon: '🌱',
        color: '#8BC34A',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Quick Delivery',
        description: 'Fast delivery within 20 minutes',
        category: 'service',
        icon: '⚡',
        color: '#FFC107',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Budget Friendly',
        description: 'Affordable meals under ₹200',
        category: 'price',
        icon: '💰',
        color: '#4CAF50',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Premium',
        description: 'High-quality gourmet dining experience',
        category: 'price',
        icon: '⭐',
        color: '#FFD700',
        isActive: true,
        usageCount: 0,
      },
      {
        name: 'Campus Delivery',
        description: 'Direct delivery to Thapar University campus',
        category: 'location',
        icon: '🏫',
        color: '#2196F3',
        isActive: true,
        usageCount: 0,
      },
    ])
    console.log('✅ Created restaurant tags')

    console.log('👥 Creating users...')
    const hashedPassword = await bcrypt.hash('123456', 12)
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@thapar.edu',
        password: hashedPassword,
        phone: '+91 98765 43210',
        role: 'user',
        address: 'Hostel Block A, Room 101, Thapar University',
      },
      {
        name: 'Jane Smith',
        email: 'jane@thapar.edu',
        password: hashedPassword,
        phone: '+91 87654 32109',
        role: 'user',
        address: 'Hostel Block B, Room 205, Thapar University',
      },
      {
        name: 'Amit Singh',
        email: 'amit@spicegarden.com',
        password: hashedPassword,
        phone: '+91 76543 21098',
        role: 'restaurant_owner',
        address: 'Near Thapar Gate 1, Patiala',
        restaurantName: 'Spice Garden',
      },
      {
        name: 'Rohit Gupta',
        email: 'rohit@pizzacorner.com',
        password: hashedPassword,
        phone: '+91 65432 10987',
        role: 'restaurant_owner',
        address: 'Thapar Campus Food Court, Patiala',
        restaurantName: 'Pizza Corner',
      },
      {
        name: 'Admin User',
        email: 'admin@grubclub.com',
        password: hashedPassword,
        phone: '+91 54321 09876',
        role: 'admin',
        address: 'Grub Club Headquarters, Patiala',
      },
    ])
    console.log('✅ Created users')

    console.log('🏪 Creating restaurants...')
    const restaurants = await Restaurant.create([
      {
        name: 'Spice Garden',
        description: 'Authentic North Indian cuisine with a modern twist. Specializing in butter chicken, tandoori dishes, and fresh naan bread.',
        cuisine: 'North Indian',
        address: 'Near Thapar Gate 1, Patiala, Punjab',
        phone: '+91 98765 43210',
        email: 'info@spicegarden.com',
        deliveryTime: '15-20 min',
        distance: '0.5 km',
        priceRange: '₹₹',
        tags: ['North Indian', 'Vegetarian', 'Quick Delivery', 'Budget Friendly'],
        status: 'approved',
        ownerId: users[2]._id,
        openingHours: '11:00 AM - 11:00 PM',
        isOpen: true,
        minimumOrder: 100,
        deliveryFee: 20,
        coordinates: {
          latitude: 30.3398,
          longitude: 76.3869,
        },
        rating: 4.8,
        totalReviews: 156,
      },
      {
        name: 'Pizza Corner',
        description: 'Fresh Italian pizzas made with authentic ingredients. From classic Margherita to gourmet toppings.',
        cuisine: 'Italian',
        address: 'Thapar Campus Food Court, Patiala, Punjab',
        phone: '+91 87654 32109',
        email: 'orders@pizzacorner.com',
        deliveryTime: '20-25 min',
        distance: '0.8 km',
        priceRange: '₹₹₹',
        tags: ['Italian', 'Quick Delivery', 'Premium'],
        status: 'approved',
        ownerId: users[3]._id,
        openingHours: '12:00 PM - 12:00 AM',
        isOpen: true,
        minimumOrder: 150,
        deliveryFee: 30,
        coordinates: {
          latitude: 30.3400,
          longitude: 76.3870,
        },
        rating: 4.6,
        totalReviews: 89,
      },
      {
        name: 'Burger Junction',
        description: 'Juicy burgers and crispy fries. American-style fast food with Indian flavors.',
        cuisine: 'Fast Food',
        address: 'Near Thapar Gate 2, Patiala, Punjab',
        phone: '+91 76543 21098',
        email: 'hello@burgerjunction.com',
        deliveryTime: '10-15 min',
        distance: '0.3 km',
        priceRange: '₹₹',
        tags: ['Fast Food', 'Quick Delivery', 'Budget Friendly'],
        status: 'approved',
        ownerId: users[0]._id,
        openingHours: '10:00 AM - 10:00 PM',
        isOpen: true,
        minimumOrder: 80,
        deliveryFee: 15,
        coordinates: {
          latitude: 30.3395,
          longitude: 76.3865,
        },
        rating: 4.7,
        totalReviews: 234,
      },
    ])
    console.log('✅ Created restaurants')

    console.log('🍽️  Creating menu items...')
    const menuItems = await MenuItem.create([
      // Spice Garden Menu
      {
        name: 'Butter Chicken',
        description: 'Tender chicken cooked in a rich, creamy tomato-based gravy with aromatic spices',
        price: 280,
        category: 'Main Course',
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'Medium',
        preparationTime: '15-20 min',
        calories: 450,
        allergens: ['Dairy'],
        ingredients: ['Chicken', 'Tomato', 'Cream', 'Butter', 'Spices'],
        restaurantId: restaurants[0]._id,
        order: 1,
      },
      {
        name: 'Paneer Tikka',
        description: 'Marinated cottage cheese grilled to perfection with spices and herbs',
        price: 180,
        category: 'Starters',
        isAvailable: true,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'Medium',
        preparationTime: '12-15 min',
        calories: 280,
        allergens: ['Dairy'],
        ingredients: ['Paneer', 'Yogurt', 'Spices', 'Herbs'],
        restaurantId: restaurants[0]._id,
        order: 2,
      },
      {
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils with cream and butter, a rich and creamy dish',
        price: 160,
        category: 'Main Course',
        isAvailable: true,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'Mild',
        preparationTime: '20-25 min',
        calories: 320,
        allergens: ['Dairy'],
        ingredients: ['Black Lentils', 'Cream', 'Butter', 'Spices'],
        restaurantId: restaurants[0]._id,
        order: 3,
      },
      {
        name: 'Garlic Naan',
        description: 'Soft bread brushed with garlic butter and baked in tandoor',
        price: 70,
        category: 'Breads',
        isAvailable: true,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'Mild',
        preparationTime: '5-8 min',
        calories: 180,
        allergens: ['Wheat', 'Dairy'],
        ingredients: ['Flour', 'Garlic', 'Butter', 'Yeast'],
        restaurantId: restaurants[0]._id,
        order: 4,
      },

      // Pizza Corner Menu
      {
        name: 'Pizza Margherita',
        description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
        price: 320,
        category: 'Pizzas',
        isAvailable: true,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'Mild',
        preparationTime: '18-22 min',
        calories: 380,
        allergens: ['Wheat', 'Dairy'],
        ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Basil'],
        restaurantId: restaurants[1]._id,
        order: 1,
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni slices with melted cheese on crispy crust',
        price: 380,
        category: 'Pizzas',
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'Medium',
        preparationTime: '20-25 min',
        calories: 450,
        allergens: ['Wheat', 'Dairy', 'Pork'],
        ingredients: ['Pizza Dough', 'Pepperoni', 'Mozzarella', 'Tomato Sauce'],
        restaurantId: restaurants[1]._id,
        order: 2,
      },
      {
        name: 'Garlic Bread',
        description: 'Crispy bread topped with garlic butter and herbs',
        price: 120,
        category: 'Sides',
        isAvailable: true,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'Mild',
        preparationTime: '8-10 min',
        calories: 220,
        allergens: ['Wheat', 'Dairy'],
        ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs'],
        restaurantId: restaurants[1]._id,
        order: 3,
      },

      // Burger Junction Menu
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
        price: 150,
        category: 'Burgers',
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'Mild',
        preparationTime: '8-12 min',
        calories: 350,
        allergens: ['Wheat', 'Beef'],
        ingredients: ['Beef Patty', 'Bun', 'Lettuce', 'Tomato', 'Sauce'],
        restaurantId: restaurants[2]._id,
        order: 1,
      },
      {
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables and vegan mayo',
        price: 130,
        category: 'Burgers',
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        spiceLevel: 'Mild',
        preparationTime: '10-15 min',
        calories: 280,
        allergens: ['Wheat'],
        ingredients: ['Veggie Patty', 'Bun', 'Lettuce', 'Tomato', 'Vegan Mayo'],
        restaurantId: restaurants[2]._id,
        order: 2,
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries seasoned with salt and herbs',
        price: 80,
        category: 'Sides',
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        spiceLevel: 'Mild',
        preparationTime: '5-8 min',
        calories: 200,
        allergens: [],
        ingredients: ['Potatoes', 'Oil', 'Salt', 'Herbs'],
        restaurantId: restaurants[2]._id,
        order: 3,
      },
    ])
    console.log('✅ Created menu items')

    console.log('✅ Database setup completed successfully!')
    console.log(`📊 Created ${users.length} users, ${restaurants.length} restaurants, ${menuItems.length} menu items, and ${tags.length} tags`)
    console.log('\n📋 Test Users (password: 123456):')
    console.log('Student: john@thapar.edu')
    console.log('Student: jane@thapar.edu')
    console.log('Restaurant Owner: amit@spicegarden.com')
    console.log('Restaurant Owner: rohit@pizzacorner.com')
    console.log('Admin: admin@grubclub.com')

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Run the setup
setupDatabase() 