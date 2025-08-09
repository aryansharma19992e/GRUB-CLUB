import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Restaurant from '@/models/Restaurant'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  await dbConnect()
  const user = await User.findById(auth.userId).populate('favoriteRestaurants', 'name description cuisine image rating deliveryTime distance priceRange tags')
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ favorites: user.favoriteRestaurants || [] })
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  await dbConnect()
  const { restaurantId } = await request.json()
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
  const exists = await Restaurant.findById(restaurantId).lean()
  if (!exists) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  const user = await User.findById(auth.userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  user.favoriteRestaurants = user.favoriteRestaurants || []
  const already = user.favoriteRestaurants.find(id => id.toString() === restaurantId)
  if (!already) {
    user.favoriteRestaurants.push(restaurantId)
    await user.save()
  }
  return NextResponse.json({ message: 'Added to favorites' })
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get('restaurantId')
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
  await dbConnect()
  await User.findByIdAndUpdate(auth.userId, { $pull: { favoriteRestaurants: restaurantId } })
  return NextResponse.json({ message: 'Removed from favorites' })
} 