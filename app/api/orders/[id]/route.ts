import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import { z } from 'zod'

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'ready', 'out_for_delivery', 'delivered']),
})

// Mock orders data (replace with database)
let mockOrders = [
  {
    id: 'ORD001',
    userId: '1',
    restaurantId: '1',
    restaurantName: 'Spice Garden',
    items: [
      { menuItemId: '1', name: 'Butter Chicken', quantity: 1, price: 280 },
      { menuItemId: '4', name: 'Garlic Naan', quantity: 2, price: 70 },
    ],
    totalAmount: 420,
    status: 'preparing',
    deliveryAddress: 'Hostel Block A, Room 101, Thapar University',
    specialInstructions: 'Less spicy please',
    estimatedDeliveryTime: '15-20 min',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'ORD002',
    userId: '1',
    restaurantId: '2',
    restaurantName: 'Pizza Corner',
    items: [
      { menuItemId: '5', name: 'Pizza Margherita', quantity: 1, price: 320 },
      { menuItemId: '7', name: 'Garlic Bread', quantity: 1, price: 120 },
    ],
    totalAmount: 440,
    status: 'delivered',
    deliveryAddress: 'Hostel Block A, Room 101, Thapar University',
    specialInstructions: '',
    estimatedDeliveryTime: '20-25 min',
    createdAt: '2024-01-14T18:45:00.000Z',
    updatedAt: '2024-01-14T19:10:00.000Z',
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const orderId = params.id
    
    // Find order
    const order = mockOrders.find(o => o.id === orderId)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Check if user has access to this order
    if (order.userId !== authResult.userId && authResult.role !== 'admin' && authResult.role !== 'restaurant_owner') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // In real implementation:
    // const order = await db.order.findUnique({
    //   where: { id: orderId },
    //   include: {
    //     items: {
    //       include: {
    //         menuItem: true,
    //       }
    //     },
    //     restaurant: true,
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         phone: true,
    //       }
    //     }
    //   }
    // })
    
    return NextResponse.json({ order })
    
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const orderId = params.id;
    const body = await request.json();
    const validatedData = updateOrderStatusSchema.parse(body);

    // Find the order
    let order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get user role
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userRole = authResult.role;

    // Allowed transitions
    const allowedTransitions = {
      pending: userRole === 'restaurant_owner' ? ['ready'] : [],
      ready: userRole === 'restaurant_owner' ? ['out_for_delivery'] : [],
      out_for_delivery: userRole === 'user' ? ['delivered'] : [],
    };
    const currentStatus = order.status;
    const nextStatus = validatedData.status;
    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status transition or insufficient permissions' }, { status: 403 });
    }

    // Update status
    order.status = nextStatus;
    order.updatedAt = new Date();
    await order.save();

    // Populate for response
    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('restaurantId', 'name')
      .lean();

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 