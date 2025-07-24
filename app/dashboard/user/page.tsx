"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  ShoppingCart, 
  Heart, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Star,
  Package,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UserDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Fetch all orders for this user for stats
    fetch(`/api/orders?userId=${user._id || user.id}&limit=1000`)
      .then(res => res.json())
      .then(data => setAllOrders(data.orders || []));
    // Initial fetch for recent orders
    fetch(`/api/orders?userId=${user._id || user.id}&limit=3`)
      .then(res => res.json())
      .then(data => setRecentOrders(data.orders || []));
    // Poll every 5 seconds for recent orders
    const interval = setInterval(() => {
      fetch(`/api/orders?userId=${user._id || user.id}&limit=3`)
        .then(res => res.json())
        .then(data => setRecentOrders(data.orders || []));
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  console.log('🔍 Dashboard - Loading:', loading, 'User:', user)
  console.log('🔍 Dashboard - User details:', {
    name: user?.name,
    email: user?.email,
    role: user?.role,
    id: user?.id
  })

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard</p>
          <div className="space-y-4">
            <Link href="/auth/login">
              <Button>Go to Login</Button>
            </Link>
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  const token = localStorage.getItem('token')
                  console.log('🔍 Stored token:', token ? token.substring(0, 20) + '...' : 'No token')
                }}
              >
                Debug Token
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const token = localStorage.getItem('token')
                  if (!token) {
                    console.log('❌ No token found')
                    return
                  }
                  
                  try {
                    const response = await fetch('/api/test-auth', {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    const data = await response.json()
                    console.log('🧪 Test auth result:', data)
                  } catch (error) {
                    console.error('❌ Test auth error:', error)
                  }
                }}
              >
                Test Auth API
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Manual user data for testing
                  const testUser = {
                    id: 'test-user',
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '+91 12345 67890',
                    address: 'Test Address',
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                  localStorage.setItem('userData', JSON.stringify(testUser))
                  console.log('✅ Set test user data:', testUser)
                  window.location.reload()
                }}
              >
                Set Test User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const token = localStorage.getItem('token')
                  const userData = localStorage.getItem('userData')
                  console.log('🔍 Current localStorage:')
                  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token')
                  console.log('User Data:', userData ? JSON.parse(userData) : 'No user data')
                }}
              >
                Check localStorage
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Prompt user for their actual registration data
                  const name = prompt('Enter your name (as registered):')
                  const email = prompt('Enter your email (as registered):')
                  const phone = prompt('Enter your phone (as registered):')
                  const address = prompt('Enter your address (as registered):')
                  
                  if (name && email) {
                    const actualUser = {
                      id: 'actual-user',
                      name: name,
                      email: email,
                      phone: phone || '',
                      address: address || '',
                      role: 'user',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                    localStorage.setItem('userData', JSON.stringify(actualUser))
                    console.log('✅ Set actual user data:', actualUser)
                    window.location.reload()
                  }
                }}
              >
                Set Actual User Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-gray-100 text-gray-800' };
      case 'ready': return { label: 'Accepted', color: 'bg-blue-100 text-blue-800' };
      case 'out_for_delivery': return { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' };
      case 'delivered': return { label: 'Delivered', color: 'bg-green-100 text-green-800' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleOrderReceived = async (orderId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: 'delivered' }),
    });
    // Refresh recent orders
    if (user) {
      fetch(`/api/orders?userId=${user._id || user.id}&limit=3`)
        .then(res => res.json())
        .then(data => setRecentOrders(data.orders || []));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your food delivery account
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/restaurants">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg border-0 font-semibold px-6 py-3" variant="default">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Browse Restaurants
                </Button>
              </Link>
              <Link href="/profile/edit">
                <Avatar className="h-16 w-16 cursor-pointer">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                  <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{allOrders.length}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Favorite Restaurants</CardTitle>
              <Heart className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{favoriteCount}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {/* Optionally show change from last week if you want */}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{allOrders.filter(o => ['pending','ready','out_for_delivery'].includes(o.status)).length}</div>
              <div className="flex items-center text-sm text-orange-600 mt-1">
                <Package className="h-4 w-4 mr-1" />
                {allOrders.filter(o => ['pending','ready','out_for_delivery'].includes(o.status)).length === 0
                  ? 'No active orders'
                  : `You have ${allOrders.filter(o => ['pending','ready','out_for_delivery'].includes(o.status)).length} active order(s)`}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Account Status</CardTitle>
              <User className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">Active</div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Star className="h-4 w-4 mr-1" />
                Verified student account
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.role}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{user?.phone}</span>
                </div>
                {user?.address && (
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{user.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">Member since {formatDate(user?.createdAt || '')}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest food orders and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-gray-500 text-sm">No recent orders found.</div>
                ) : (
                  recentOrders.map((order) => {
                    const statusInfo = getStatusLabel(order.status);
                    return (
                      <div key={order._id || order.id || order.orderNumber} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.items && order.items.length > 0 ? `${order.items[0].name} from ${order.restaurantName || ''}` : order.restaurantName || ''}</p>
                          <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {order.status === 'delivered' && order.actualDeliveryTime ? `Delivered on ${formatDate(order.actualDeliveryTime)}` :
                              order.status === 'out_for_delivery' ? 'Your order is out for delivery!' :
                              order.status === 'ready' ? 'Order accepted by restaurant.' :
                              order.status === 'pending' ? 'Order placed, waiting for restaurant.' :
                              order.status === 'cancelled' ? 'Order was cancelled.' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={statusInfo.color}>{statusInfo.label}</Badge>
                          {['ready', 'out_for_delivery'].includes(order.status) && (
                            <Button size="sm" variant="outline" onClick={() => handleOrderReceived(order._id)}>
                              Order Received
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>What would you like to do today?</CardDescription>
            </CardHeader>
            <CardContent>
                              <div className="space-y-3">
                  <Link href="/orders/history">
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      View Order History
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button className="w-full justify-start" variant="outline">
                      <Heart className="h-4 w-4 mr-2" />
                      My Favorites
                    </Button>
                  </Link>
                  <Link href="/profile/edit">
                    <Button className="w-full justify-start" variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Link href="/support">
                    <Button className="w-full justify-start" variant="outline">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Support
                    </Button>
                  </Link>
                  <Button className="w-full justify-start" variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
