import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import RestaurantOwnerInvite from '@/models/RestaurantOwnerInvite';
import RestaurantUniqueCode from '@/models/RestaurantUniqueCode';
import Restaurant from '@/models/Restaurant';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['user', 'restaurant_owner', 'admin']).default('user'),
  address: z.string().optional(),
  restaurantName: z.string().min(2, 'Restaurant name is required for owners').optional(),
  image: z.string().optional(),
  inviteCode: z.string().optional(),
  adminCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Registration request received')
    
    // Connect to database
    await dbConnect()
    console.log('✅ Database connected')
    
    const body = await request.json()
    console.log('📝 Request body:', { ...body, password: '[HIDDEN]' })
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    // If admin, require correct adminCode
    if (validatedData.role === 'admin') {
      if (!validatedData.adminCode || validatedData.adminCode !== process.env.ADMIN_SIGNUP_CODE) {
        return NextResponse.json({ error: 'Invalid admin code' }, { status: 403 });
      }
    }
 
    console.log('✅ Input validation passed')
    
    // Check if user already exists in database
    const existingUser = await User.findOne({ email: validatedData.email })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // If restaurant_owner, require restaurantName
    if (validatedData.role === 'restaurant_owner' && !validatedData.restaurantName) {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    console.log('🔐 Password hashed')
    
    // Create user in database
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      address: validatedData.address,
      restaurantName: validatedData.restaurantName,
      role: validatedData.role,
    })

    // If restaurant_owner, ensure only one restaurant per owner
    if (validatedData.role === 'restaurant_owner') {
      // Check if user already has a restaurant
      const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });
      if (!existingRestaurant) {
        // Only create restaurant if no invite code is provided
        if (!validatedData.inviteCode) {
          await Restaurant.create({
            name: validatedData.restaurantName,
            ownerId: user._id,
            description: 'Your restaurant description',
            cuisine: 'Multi-cuisine',
            address: validatedData.address || 'Your address',
            phone: validatedData.phone,
            email: validatedData.email,
            image: validatedData.image || '/placeholder.jpg',
            openingHours: '10:00-22:00',
            deliveryTime: '30 min',
            distance: '1 km',
            priceRange: '₹₹',
            status: 'approved',
            minimumOrder: 100,
            deliveryFee: 10,
            coordinates: { latitude: 0, longitude: 0 },
          });
        }
      }
    }
    
    console.log('✅ User created successfully in database:', user._id)
    console.log('📝 User data created:', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    })
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log('🔐 JWT token generated')
    
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
    
        console.log('📤 Returning user data:', userResponse)
    
    // Handle invite code linking for existing restaurants
    if (validatedData.inviteCode) {
      const codeEntry = await RestaurantUniqueCode.findOne({ uniqueCode: validatedData.inviteCode });
      if (!codeEntry) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }
      
      // Find the restaurant and link it to the user
      const restaurant = await Restaurant.findOne({ name: codeEntry.restaurantName });
      if (restaurant) {
        // Update the restaurant's ownerId to link it to this user
        await Restaurant.findByIdAndUpdate(
          restaurant._id,
          { ownerId: user._id }
        );
        
        // Update user role to restaurant_owner if not already
        if (user.role !== 'restaurant_owner') {
          await User.findByIdAndUpdate(user._id, { role: 'restaurant_owner' });
          userResponse.role = 'restaurant_owner';
        }
      }
    }
    
    return NextResponse.json(
      { 
        message: 'User registered successfully!',
        token,
        user: userResponse
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('❌ Registration error:', error)
    
    if (error instanceof z.ZodError) {
      console.log('🔍 Validation errors:', error.errors)
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 