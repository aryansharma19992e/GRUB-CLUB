import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for updating profile
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(1, 'Address is required').optional(),
})

// Import database connection and User model
import dbConnect from '@/lib/db'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 User profile API called')
    
    // Authenticate user
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      console.log('❌ Authentication failed:', authResult.status)
      return authResult
    }
    
    console.log('✅ Authentication successful, userId:', authResult.userId)
    
    // Connect to database
    await dbConnect()
    console.log('✅ Database connected')
    
    // Find user in database
    const user = await User.findById(authResult.userId).select('-password')
    console.log('🔍 User found in database:', user ? 'Yes' : 'No')
    
    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
    
    console.log('✅ Returning user data:', userData)
    
    return NextResponse.json({ user: userData })
    
  } catch (error) {
    console.error('❌ Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body)
    
    // Connect to database
    await dbConnect()
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      authResult.userId,
      {
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 