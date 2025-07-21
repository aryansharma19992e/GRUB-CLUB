import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Restaurant from '@/models/Restaurant'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const cuisine = searchParams.get('cuisine')
    const ownerId = searchParams.get('ownerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query
    const query: any = {}
    if (status) query.status = status
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' }
    if (!status) query.status = 'approved'
    if (ownerId) query.ownerId = ownerId

    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit

    const restaurants = await Restaurant.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Restaurant.countDocuments(query)

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
} 