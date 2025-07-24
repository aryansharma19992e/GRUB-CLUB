"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, Store, TrendingUp } from "lucide-react"
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRestaurants, setRecentRestaurants] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch('/api/users', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setTotalUsers(data.total || 0);
        if (data.users) {
          setRecentUsers(data.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
        }
      });
    fetch('/api/restaurants?limit=5&sortBy=createdAt&sortOrder=desc')
      .then(res => res.json())
      .then(data => setRecentRestaurants(data.restaurants || []));
    // Fetch total restaurants
    fetch('/api/restaurants?limit=1000')
      .then(res => res.json())
      .then(data => setTotalRestaurants(data.pagination?.total || (data.restaurants ? data.restaurants.length : 0)));
    // Fetch all orders and sum revenue
    fetch('/api/orders?limit=1000')
      .then(res => res.json())
      .then(data => setTotalRevenue(data.orders ? data.orders.reduce((sum, o) => sum + (o.total || 0), 0) : 0));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the entire Grub Club platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRestaurants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total restaurants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Combine and sort recent users and restaurants by createdAt
                  const activities = [
                    ...recentRestaurants.map(rest => ({
                      type: 'restaurant',
                      _id: rest._id,
                      name: rest.name,
                      createdAt: rest.createdAt,
                    })),
                    ...recentUsers.map(user => ({
                      type: 'user',
                      _id: user._id,
                      name: user.name,
                      createdAt: user.createdAt,
                    })),
                  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                  return activities.map(activity => (
                    <div key={activity.type + '-' + activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {activity.type === 'restaurant' ? 'New Restaurant Registration' : 'User Registration'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.type === 'restaurant'
                            ? `${activity.name} joined the platform`
                            : `${activity.name} signed up`}
                        </p>
                      </div>
                      <span className={activity.type === 'restaurant' ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Platform management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard/admin/users')}>
                  Manage Users
                </Button>
                <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard/admin/restaurants')}>
                  Approve Restaurants
                </Button>
                <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard/admin/analytics')}>
                  View Analytics
                </Button>
                <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard/admin/settings')}>
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
