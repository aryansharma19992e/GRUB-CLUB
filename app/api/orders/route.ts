import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import MenuItem from '@/models/MenuItem'

// Validation schema for order creation
const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  items: z.array(z.object({
    menuItemId: z.string().min(1, 'Menu item ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    specialInstructions: z.string().optional(),
  })).min(1, 'At least one item is required'),
  deliveryAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'wallet']),
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Build query
    const query: any = {}
    
    if (userId) {
      query.userId = userId
    }
    
    if (restaurantId) {
      query.restaurantId = restaurantId
    }
    
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Execute query
    const orders = await Order.find(query)
      .sort({ orderTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('restaurantId', 'name')
      .lean()
    
    // Get total count for pagination
    const total = await Order.countDocuments(query)
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    // Validate input
    const validatedData = createOrderSchema.parse(body)
    // Fetch menu items to calculate prices
    const menuItemIds = validatedData.items.map(item => item.menuItemId)
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } })
    if (menuItems.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: 'Some menu items not found' },
        { status: 400 }
      )
    }
    // Create a map of menu items for easy lookup
    const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]))
    // Calculate order items with prices
    const orderItems = validatedData.items.map(item => {
      const menuItem = menuItemMap.get(item.menuItemId)
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`)
      }
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        totalPrice: menuItem.price * item.quantity,
      }
    })
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const deliveryFee = 0 // This could be calculated based on distance
    const tax = subtotal * 0.05 // 5% tax
    const total = subtotal + deliveryFee + tax
    // Calculate estimated delivery time (30 minutes from now)
    const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000)
    // Generate unique order number
    const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
    // Create order
    const order = await Order.create({
      orderNumber,
      userId: validatedData.userId,
      restaurantId: validatedData.restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod: validatedData.paymentMethod,
      deliveryAddress: validatedData.deliveryAddress,
      deliveryInstructions: validatedData.deliveryInstructions,
      estimatedDeliveryTime,
      orderTime: new Date(),
      status: 'pending',
    })
    return NextResponse.json(
      { 
        message: 'Order created successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    // Log full error stack for debugging
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 