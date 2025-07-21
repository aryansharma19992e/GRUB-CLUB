import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

// Mock data for restaurant dashboard (replace with database)
const mockRestaurantStats = {
  todayOrders: 23,
  todayRevenue: 4580,
  avgRating: 4.8,
  totalItems: 45,
  pendingOrders: 5,
  completedOrders: 18,
  monthlyRevenue: 125000,
  monthlyOrders: 456,
}

const mockRecentOrders = [
  {
    id: 'ORD001',
    customer: 'Rahul Sharma',
    items: ['Butter Chicken', 'Naan', 'Lassi'],
    total: 420,
    status: 'preparing',
    time: '2 mins ago',
    estimatedTime: '15 mins',
    createdAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'ORD002',
    customer: 'Priya Singh',
    items: ['Paneer Tikka', 'Dal Makhani'],
    total: 340,
    status: 'ready',
    time: '5 mins ago',
    estimatedTime: 'Ready',
    createdAt: '2024-01-15T10:25:00.000Z',
  },
  {
    id: 'ORD003',
    customer: 'Amit Kumar',
    items: ['Pizza Margherita', 'Garlic Bread'],
    total: 380,
    status: 'delivered',
    time: '12 mins ago',
    estimatedTime: 'Delivered',
    createdAt: '2024-01-15T10:18:00.000Z',
  },
  {
    id: 'ORD004',
    customer: 'Sneha Patel',
    items: ['Burger', 'Fries', 'Coke'],
    total: 280,
    status: 'cancelled',
    time: '18 mins ago',
    estimatedTime: 'Cancelled',
    createdAt: '2024-01-15T10:12:00.000Z',
  },
]

const mockMenuItems = [
  {
    id: 1,
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 280,
    status: 'available',
    orders: 15,
    revenue: 4200,
  },
  {
    id: 2,
    name: 'Paneer Tikka',
    category: 'Starters',
    price: 180,
    status: 'available',
    orders: 12,
    revenue: 2160,
  },
  {
    id: 3,
    name: 'Dal Makhani',
    category: 'Main Course',
    price: 160,
    status: 'out_of_stock',
    orders: 8,
    revenue: 1280,
  },
  {
    id: 4,
    name: 'Garlic Naan',
    category: 'Breads',
    price: 70,
    status: 'available',
    orders: 20,
    revenue: 1400,
  },
]

const mockAnalytics = {
  dailyRevenue: [
    { date: '2024-01-10', revenue: 3200 },
    { date: '2024-01-11', revenue: 4100 },
    { date: '2024-01-12', revenue: 3800 },
    { date: '2024-01-13', revenue: 5200 },
    { date: '2024-01-14', revenue: 4800 },
    { date: '2024-01-15', revenue: 4580 },
  ],
  topItems: [
    { name: 'Butter Chicken', orders: 45, revenue: 12600 },
    { name: 'Garlic Naan', orders: 38, revenue: 2660 },
    { name: 'Paneer Tikka', orders: 32, revenue: 5760 },
    { name: 'Dal Makhani', orders: 28, revenue: 4480 },
  ],
  orderStatusDistribution: [
    { status: 'pending', count: 5 },
    { status: 'preparing', count: 8 },
    { status: 'ready', count: 3 },
    { status: 'delivered', count: 18 },
    { status: 'cancelled', count: 2 },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate restaurant owner
    const authResult = requireRole(request, ['restaurant_owner'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    // In real implementation, fetch data from database:
    // const restaurantId = await getRestaurantIdByOwnerId(authResult.userId)
    // const stats = await db.$transaction([
    //   db.order.count({
    //     where: {
    //       restaurantId,
    //       createdAt: {
    //         gte: new Date(new Date().setHours(0, 0, 0, 0))
    //       }
    //     }
    //   }),
    //   db.order.aggregate({
    //     where: {
    //       restaurantId,
    //       createdAt: {
    //         gte: new Date(new Date().setHours(0, 0, 0, 0))
    //       }
    //     },
    //     _sum: { totalAmount: true }
    //   }),
    //   // ... more queries
    // ])
    
    return NextResponse.json({
      stats: mockRestaurantStats,
      recentOrders: mockRecentOrders,
      menuItems: mockMenuItems,
      analytics: mockAnalytics,
    })
    
  } catch (error) {
    console.error('Error fetching restaurant dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 