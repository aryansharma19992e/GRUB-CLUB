import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Restaurant from '@/models/Restaurant'
import MenuItem from '@/models/MenuItem'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const restaurantId = params.id

    // Find restaurant by _id
    const restaurant = await Restaurant.findById(restaurantId).lean()
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Get menu items for this restaurant
    const menuItems = await MenuItem.find({ restaurantId: restaurant._id }).lean()

    // Group menu items by category
    const menuByCategory = {}
    for (const item of menuItems) {
      if (!menuByCategory[item.category]) menuByCategory[item.category] = []
      menuByCategory[item.category].push(item)
    }

    return NextResponse.json({
      restaurant,
      menu: menuByCategory,
      categories: Object.keys(menuByCategory),
      totalItems: menuItems.length,
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 