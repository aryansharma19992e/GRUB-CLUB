import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

// Mock data for admin dashboard (replace with database)
const mockStats = {
  totalUsers: 1247,
  totalRestaurants: 23,
  totalOrders: 5689,
  totalRevenue: 234567,
  newUsersThisMonth: 127,
  newRestaurantsThisMonth: 5,
  ordersGrowth: 23,
  revenueGrowth: 18,
}

const mockRecentOrders = [
  {
    id: 'ORD001',
    customerName: 'Rahul Sharma',
    restaurantName: 'Spice Garden',
    totalAmount: 420,
    status: 'preparing',
    createdAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'ORD002',
    customerName: 'Priya Singh',
    restaurantName: 'Pizza Corner',
    totalAmount: 380,
    status: 'delivered',
    createdAt: '2024-01-15T09:15:00.000Z',
  },
  {
    id: 'ORD003',
    customerName: 'Amit Kumar',
    restaurantName: 'Burger Junction',
    totalAmount: 280,
    status: 'ready',
    createdAt: '2024-01-15T08:45:00.000Z',
  },
]

const mockTopRestaurants = [
  {
    id: '1',
    name: 'Spice Garden',
    owner: 'Amit Singh',
    rating: 4.8,
    orders: 234,
    revenue: 45600,
  },
  {
    id: '2',
    name: 'Pizza Corner',
    owner: 'Rohit Gupta',
    rating: 4.6,
    orders: 189,
    revenue: 38900,
  },
  {
    id: '3',
    name: 'Burger Junction',
    owner: 'Neha Patel',
    rating: 4.7,
    orders: 156,
    revenue: 28700,
  },
]

const mockPendingApprovals = [
  {
    id: '1',
    name: 'Tasty Bites',
    owner: 'Rajesh Kumar',
    cuisine: 'Multi-cuisine',
    address: 'Near Thapar Gate 2',
    phone: '+91 98765 43210',
    appliedDate: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Coffee House',
    owner: 'Priya Sharma',
    cuisine: 'Cafe & Beverages',
    address: 'Thapar Campus',
    phone: '+91 87654 32109',
    appliedDate: '2024-01-14T00:00:00.000Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = requireRole(request, ['admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    // In real implementation, fetch data from database:
    // const stats = await db.$transaction([
    //   db.user.count(),
    //   db.restaurant.count(),
    //   db.order.count(),
    //   db.order.aggregate({
    //     _sum: { totalAmount: true }
    //   }),
    //   db.user.count({
    //     where: {
    //       createdAt: {
    //         gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    //       }
    //     }
    //   }),
    //   // ... more queries
    // ])
    
    return NextResponse.json({
      stats: mockStats,
      recentOrders: mockRecentOrders,
      topRestaurants: mockTopRestaurants,
      pendingApprovals: mockPendingApprovals,
    })
    
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 