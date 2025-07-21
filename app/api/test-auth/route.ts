import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test auth API called')
    
    // Check if token exists in request
    const authHeader = request.headers.get('authorization')
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Try to authenticate
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      console.log('❌ Auth failed:', authResult.status)
      return NextResponse.json({ 
        error: 'Auth failed', 
        status: authResult.status,
        message: 'Authentication required'
      })
    }
    
    console.log('✅ Auth successful, userId:', authResult.userId)
    
    // Try to connect to database
    try {
      await dbConnect()
      console.log('✅ Database connected')
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      })
    }
    
    // Try to find user
    try {
      const user = await User.findById(authResult.userId)
      console.log('🔍 User found:', user ? 'Yes' : 'No')
      
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }
        })
      } else {
        return NextResponse.json({
          error: 'User not found in database',
          userId: authResult.userId
        })
      }
    } catch (userError) {
      console.log('❌ User lookup failed:', userError)
      return NextResponse.json({
        error: 'User lookup failed',
        details: userError instanceof Error ? userError.message : 'Unknown error'
      })
    }
    
  } catch (error) {
    console.error('❌ Test auth error:', error)
    return NextResponse.json({
      error: 'Test auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 