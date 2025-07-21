const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grub-club'

// Models
const User = require('../models/User').default
const Restaurant = require('../models/Restaurant').default
const MenuItem = require('../models/MenuItem').default
const RestaurantTag = require('../models/RestaurantTag').default

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await User.deleteMany({})
    await Restaurant.deleteMany({})
    await MenuItem.deleteMany({})
    await RestaurantTag.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create restaurant tags
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
    console.log('🏷️  Created restaurant tags')

    // Hash password for users
    const hashedPassword = await bcrypt.hash('123456', 12)

    // Create users
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
    console.log('👥 Created users')

    // Create restaurants
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
        ownerId: users[0]._id, // Using first user as owner for demo
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
    console.log('🏪 Created restaurants')

    // Create menu items
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
    console.log('🍽️  Created menu items')

    console.log('✅ Database seeding completed successfully!')
    console.log(`📊 Created ${users.length} users, ${restaurants.length} restaurants, ${menuItems.length} menu items, and ${tags.length} tags`)
    console.log('\n📋 Test Users (password: 123456):')
    console.log('Student: john@thapar.edu')
    console.log('Student: jane@thapar.edu')
    console.log('Restaurant Owner: amit@spicegarden.com')
    console.log('Restaurant Owner: rohit@pizzacorner.com')
    console.log('Admin: admin@grubclub.com')

    await mongoose.disconnect()
    return {
      users,
      restaurants,
      menuItems,
      tags,
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    await mongoose.disconnect()
    throw error
  }
}

// Run seeder
seedData()
  .then(() => {
    console.log('✅ Seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }) 