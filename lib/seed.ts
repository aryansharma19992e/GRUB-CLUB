import 'dotenv/config';
import dbConnect from './db'
import User from '@/models/User'
import Restaurant from '@/models/Restaurant'
import MenuItem from '@/models/MenuItem'
import RestaurantTag from '@/models/RestaurantTag'
import RestaurantUniqueCode from '@/models/RestaurantUniqueCode';

const seedData = async () => {
  try {
    await dbConnect()
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await User.deleteMany({})
    await Restaurant.deleteMany({})
    await MenuItem.deleteMany({})
    await RestaurantTag.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create users (minimal, just for ownerId references)
    const users = await User.create([
      { name: 'Owner1', email: 'owner1@grub.com', password: 'test123', phone: '111', role: 'restaurant_owner', address: 'A' },
      { name: 'Owner2', email: 'owner2@grub.com', password: 'test22', phone: '222', role: 'restaurant_owner', address: 'B' },
      { name: 'Owner3', email: 'owner3@grub.com', password: 'test22', phone: '333', role: 'restaurant_owner', address: 'C' },
      { name: 'Owner4', email: 'owner4@grub.com', password: 'test22', phone: '444', role: 'restaurant_owner', address: 'D' },
      { name: 'Owner5', email: 'owner5@grub.com', password: 'test44', phone: '555', role: 'restaurant_owner', address: 'E' },
      { name: 'Owner6', email: 'owner6@grub.com', password: 'test44', phone: '666', role: 'restaurant_owner', address: 'F' },
    ])
    console.log('👥 Created users')

    // Create restaurants
    const restaurants = await Restaurant.create([
      { name: 'Wrapchik', description: 'Delicious rolls and wraps.', cuisine: 'Rolls & Wraps', address: 'A', phone: '111', email: 'wrapchik@grub.com', deliveryTime: '15-20 min', distance: '0.5 km', priceRange: '₹₹', tags: ['Wraps'], status: 'approved', ownerId: users[0]._id, openingHours: '10:00-22:00', isOpen: true, minimumOrder: 100, deliveryFee: 10, coordinates: { latitude: 0, longitude: 0 }, rating: 4.8, totalReviews: 10 },
      { name: 'pizza nation', description: 'Cheesy pizzas.', cuisine: 'Italian Pizza', address: 'B', phone: '222', email: 'pizza@grub.com', deliveryTime: '20-25 min', distance: '0.8 km', priceRange: '₹₹₹', tags: ['Pizza'], status: 'approved', ownerId: users[1]._id, openingHours: '10:00-22:00', isOpen: true, minimumOrder: 100, deliveryFee: 10, coordinates: { latitude: 0, longitude: 0 }, rating: 4.7, totalReviews: 10 },
      { name: 'dessert club', description: 'Sweet treats.', cuisine: 'Desserts & Sweets', address: 'C', phone: '333', email: 'dessert@grub.com', deliveryTime: '10-15 min', distance: '0.3 km', priceRange: '₹₹', tags: ['Desserts'], status: 'approved', ownerId: users[2]._id, openingHours: '10:00-22:00', isOpen: true, minimumOrder: 100, deliveryFee: 10, coordinates: { latitude: 0, longitude: 0 }, rating: 4.6, totalReviews: 10 },
      { name: 'honey cafe', description: 'Cafe and snacks.', cuisine: 'Cafe & Snacks', address: 'D', phone: '444', email: 'honey@grub.com', deliveryTime: '18-22 min', distance: '0.7 km', priceRange: '₹', tags: ['Cafe'], status: 'approved', ownerId: users[3]._id, openingHours: '10:00-22:00', isOpen: true, minimumOrder: 100, deliveryFee: 10, coordinates: { latitude: 0, longitude: 0 }, rating: 4.5, totalReviews: 10 },
      { name: 'sips and bites', description: 'Beverages and fast food.', cuisine: 'Beverages & Fast Food', address: 'E', phone: '555', email: 'sips@grub.com', deliveryTime: '12-18 min', distance: '0.4 km', priceRange: '₹', tags: ['Beverages'], status: 'approved', ownerId: users[4]._id, openingHours: '10:00-22:00', isOpen: true, minimumOrder: 100, deliveryFee: 10, coordinates: { latitude: 0, longitude: 0 }, rating: 4.4, totalReviews: 10 },
      { name: 'chilli chatkara', description: 'Spicy Indian street food.', cuisine: 'Indian Street Food', address: 'F', phone: '666', email: 'chilli@grub.com', deliveryTime: '25-30 min', distance: '1.2 km', priceRange: '₹₹₹', tags: ['Street Food'], status: 'approved', ownerId: users[5]._id, openingHours: '10:00-22:00', isOpen: true, minimumOrder: 100, deliveryFee: 10, coordinates: { latitude: 0, longitude: 0 }, rating: 4.3, totalReviews: 10 },
    ])
    console.log('🏪 Created restaurants:', restaurants.map(r => r.name))

    // After creating restaurants
    // Seed RestaurantUniqueCode
    const uniqueCodes = await RestaurantUniqueCode.create([
      { restaurantName: 'Wrapchik', uniqueCode: 'REST-WRAPCHIK-1234' },
      { restaurantName: 'pizza nation', uniqueCode: 'REST-PIZZANATION-1234' },
      { restaurantName: 'dessert club', uniqueCode: 'REST-DESSERTCLUB-1234' },
      { restaurantName: 'honey cafe', uniqueCode: 'REST-HONEYCAFE-1234' },
      { restaurantName: 'sips and bites', uniqueCode: 'REST-SIPSANDBITES-1234' },
      { restaurantName: 'chilli chatkara', uniqueCode: 'REST-CHILLICHATKARA-1234' },
    ]);
    console.log('🔑 Seeded restaurant unique codes:', uniqueCodes.map(c => `${c.restaurantName}: ${c.uniqueCode}`));

    // Create menu items for each restaurant
    const menuItems = await MenuItem.create([
      // Wrapchik
      { name: 'Paneer Wrap', description: 'Grilled paneer with veggies.', price: 120, category: 'Wraps', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Medium', preparationTime: '10-15 min', restaurantId: restaurants[0]._id, order: 1 },
      { name: 'Chicken Tikka Roll', description: 'Juicy chicken tikka roll.', price: 140, category: 'Rolls', isAvailable: true, isVegetarian: false, isVegan: false, spiceLevel: 'Medium', preparationTime: '12-15 min', restaurantId: restaurants[0]._id, order: 2 },
      // pizza nation
      { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella.', price: 320, category: 'Pizzas', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '20-25 min', restaurantId: restaurants[1]._id, order: 1 },
      { name: 'Pepperoni Pizza', description: 'Spicy pepperoni pizza.', price: 380, category: 'Pizzas', isAvailable: true, isVegetarian: false, isVegan: false, spiceLevel: 'Medium', preparationTime: '20-25 min', restaurantId: restaurants[1]._id, order: 2 },
      // dessert club
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake.', price: 150, category: 'Cakes', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '10-15 min', restaurantId: restaurants[2]._id, order: 1 },
      { name: 'Rasmalai', description: 'Soft cheese dumplings.', price: 120, category: 'Sweets', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '8-10 min', restaurantId: restaurants[2]._id, order: 2 },
      // honey cafe
      { name: 'Cappuccino', description: 'Rich espresso with milk foam.', price: 100, category: 'Coffee', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '5-8 min', restaurantId: restaurants[3]._id, order: 1 },
      { name: 'Veg Club Sandwich', description: 'Triple layered sandwich.', price: 120, category: 'Snacks', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '8-10 min', restaurantId: restaurants[3]._id, order: 2 },
      // sips and bites
      { name: 'Oreo Shake', description: 'Creamy shake with Oreo.', price: 120, category: 'Shakes', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '8-10 min', restaurantId: restaurants[4]._id, order: 1 },
      { name: 'Veg Burger', description: 'Crispy veggie patty.', price: 90, category: 'Fast Food', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Mild', preparationTime: '10-12 min', restaurantId: restaurants[4]._id, order: 2 },
      // chilli chatkara
      { name: 'Pav Bhaji', description: 'Spicy mashed veggies.', price: 110, category: 'Street Food', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Hot', preparationTime: '12-15 min', restaurantId: restaurants[5]._id, order: 1 },
      { name: 'Chole Bhature', description: 'Fried bread with spicy chickpea curry.', price: 130, category: 'Street Food', isAvailable: true, isVegetarian: true, isVegan: false, spiceLevel: 'Hot', preparationTime: '15-18 min', restaurantId: restaurants[5]._id, order: 2 },
    ])
    console.log('🍽️  Created menu items:', menuItems.map(m => m.name))

    console.log('✅ Database seeding completed successfully!')
    console.log(`📊 Created ${users.length} users, ${restaurants.length} restaurants, ${menuItems.length} menu items`)

    return { users, restaurants, menuItems }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}
seedData();
