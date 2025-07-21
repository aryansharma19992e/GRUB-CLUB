import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/db'
import Review from '@/models/Review'
import Order from '@/models/Order'

// Validation schema for review creation
const createReviewSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review cannot exceed 1000 characters'),
  foodRating: z.number().min(1, 'Food rating must be at least 1').max(5, 'Food rating cannot exceed 5'),
  serviceRating: z.number().min(1, 'Service rating must be at least 1').max(5, 'Service rating cannot exceed 5'),
  deliveryRating: z.number().min(1, 'Delivery rating must be at least 1').max(5, 'Delivery rating cannot exceed 5'),
  valueRating: z.number().min(1, 'Value rating must be at least 1').max(5, 'Value rating cannot exceed 5'),
  images: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')
    const rating = searchParams.get('rating')
    const isVerified = searchParams.get('isVerified')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build query
    const query: any = {}
    
    if (restaurantId) {
      query.restaurantId = restaurantId
    }
    
    if (userId) {
      query.userId = userId
    }
    
    if (orderId) {
      query.orderId = orderId
    }
    
    if (rating) {
      query.rating = parseInt(rating)
    }
    
    if (isVerified === 'true') {
      query.isVerified = true
    }
    
    // Only show non-reported reviews by default
    query.isReported = false
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Execute query
    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .populate('restaurantId', 'name')
      .populate('orderId', 'orderNumber')
      .lean()
    
    // Get total count for pagination
    const total = await Review.countDocuments(query)
    
    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
    
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createReviewSchema.parse(body)
    
    // Check if order exists and belongs to the user
    const order = await Order.findOne({
      _id: validatedData.orderId,
      userId: validatedData.userId,
      restaurantId: validatedData.restaurantId,
      status: 'delivered',
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not eligible for review' },
        { status: 400 }
      )
    }
    
    // Check if review already exists for this order
    const existingReview = await Review.findOne({ orderId: validatedData.orderId })
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this order' },
        { status: 400 }
      )
    }
    
    // Create review
    const review = await Review.create({
      ...validatedData,
      images: validatedData.images ?? [],
      isVerified: false,
      helpfulCount: 0,
      reportedCount: 0,
      isReported: false,
    })
    
    // Update restaurant rating (this could be done in a background job)
    // For now, we'll just create the review
    
    return NextResponse.json(
      { 
        message: 'Review created successfully',
        review: {
          id: review._id,
          rating: review.rating,
          review: review.review,
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
} 