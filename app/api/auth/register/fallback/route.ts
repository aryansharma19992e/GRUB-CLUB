import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone number is required'), // More flexible phone validation
  role: z.enum(['user', 'restaurant_owner', 'admin']).default('user'),
  address: z.string().optional(),
  restaurantName: z.string().optional(),
})

// Temporary in-memory storage (for testing only)
const tempUsers: any[] = []

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Fallback registration request received')
    
    const body = await request.json()
    console.log('📝 Request body:', { ...body, password: '[HIDDEN]' })
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    console.log('✅ Input validation passed')
    
    // Check if user already exists (in temp storage)
    const existingUser = tempUsers.find(user => user.email === validatedData.email)
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Create user (without password hashing for simplicity)
    const user = {
      id: Date.now().toString(),
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      role: validatedData.role,
      address: validatedData.address,
      restaurantName: validatedData.restaurantName,
      createdAt: new Date().toISOString()
    }
    
    tempUsers.push(user)
    
    console.log('✅ User created successfully (temporary storage):', user.id)
    console.log('📊 Total users in temp storage:', tempUsers.length)
    
    return NextResponse.json(
      { 
        message: 'User registered successfully (temporary storage)',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        note: 'This is temporary storage. Data will be lost when server restarts.'
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('❌ Fallback registration error:', error)
    
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