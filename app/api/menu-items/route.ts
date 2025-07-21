import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/db'
import MenuItem from '@/models/MenuItem'

// Validation schema for menu item creation
const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  spiceLevel: z.enum(['Mild', 'Medium', 'Hot', 'Extra Hot']).optional(),
  preparationTime: z.string().min(1, 'Preparation time is required'),
  calories: z.number().min(0).optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  order: z.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const idsParam = request.nextUrl.searchParams.get('ids');
    if (!idsParam) {
      return NextResponse.json({ items: [] });
    }
    const ids = idsParam.split(',').map((id) => id.trim());
    const items = await MenuItem.find({ _id: { $in: ids } }).lean();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input
    const validatedData = createMenuItemSchema.parse(body)
    
    // Check if menu item with same name already exists in the restaurant
    const existingItem = await MenuItem.findOne({ 
      restaurantId: validatedData.restaurantId,
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') }
    })
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'Menu item with this name already exists in this restaurant' },
        { status: 400 }
      )
    }
    
    // Create menu item
    const menuItem = await MenuItem.create({
      ...validatedData,
      isAvailable: validatedData.isAvailable ?? true,
      isVegetarian: validatedData.isVegetarian ?? false,
      isVegan: validatedData.isVegan ?? false,
      spiceLevel: validatedData.spiceLevel ?? 'Mild',
      allergens: validatedData.allergens ?? [],
      ingredients: validatedData.ingredients ?? [],
      order: validatedData.order ?? 0,
    })
    
    return NextResponse.json(
      { 
        message: 'Menu item created successfully',
        menuItem: {
          id: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          category: menuItem.category,
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating menu item:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
} 