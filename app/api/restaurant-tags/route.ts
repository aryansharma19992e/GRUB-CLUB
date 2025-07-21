import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/db'
import RestaurantTag from '@/models/RestaurantTag'

// Validation schema for tag creation
const createTagSchema = z.object({
  name: z.string().min(2, 'Tag name must be at least 2 characters').max(50, 'Tag name cannot exceed 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(200, 'Description cannot exceed 200 characters'),
  category: z.enum(['cuisine', 'dietary', 'service', 'atmosphere', 'price', 'location']),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'usageCount'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build query
    const query: any = {}
    
    if (category) {
      query.category = category
    }
    
    if (isActive === 'true') {
      query.isActive = true
    }
    
    if (search) {
      query.$text = { $search: search }
    }
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Execute query
    const tags = await RestaurantTag.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await RestaurantTag.countDocuments(query)
    
    // Group by category for better organization
    const groupedTags = tags.reduce((acc, tag) => {
      const category = tag.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(tag)
      return acc
    }, {} as Record<string, any[]>)
    
    return NextResponse.json({
      tags: groupedTags,
      allTags: tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
    
  } catch (error) {
    console.error('Error fetching restaurant tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createTagSchema.parse(body)
    
    // Check if tag with same name already exists
    const existingTag = await RestaurantTag.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') }
    })
    
    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 400 }
      )
    }
    
    // Create tag
    const tag = await RestaurantTag.create({
      ...validatedData,
      isActive: validatedData.isActive ?? true,
      usageCount: 0,
    })
    
    return NextResponse.json(
      { 
        message: 'Restaurant tag created successfully',
        tag: {
          id: tag._id,
          name: tag.name,
          category: tag.category,
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating restaurant tag:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create restaurant tag' },
      { status: 500 }
    )
  }
} 