'use client';
import React, { useEffect, useState } from 'react';
import { ChartContainer } from '@/components/ui/chart';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    Promise.all([
      fetch('/api/orders?limit=1000', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }).then(res => res.json()),
      fetch('/api/restaurants?limit=1000', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }).then(res => res.json()),
      fetch('/api/users', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }).then(res => res.json()),
    ]).then(([ordersData, restaurantsData, usersData]) => {
      setOrders(ordersData.orders || []);
      setRestaurants(restaurantsData.restaurants || []);
      setUsers(usersData.users || []);
      setLoading(false);
    });
  }, []);

  // Revenue over time (by day)
  const revenueByDate = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + (order.total || 0);
    return acc;
  }, {});
  const revenueData = Object.entries(revenueByDate).map(([date, total]) => ({ date, total }));

  // Orders per restaurant
  const ordersByRestaurant = restaurants.map(rest => ({
    name: rest.name,
    orders: orders.filter(o => (o.restaurantId?._id || o.restaurantId) === (rest._id || rest.id)).length,
  }));

  // User roles pie chart
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  const roleData = Object.entries(roleCounts).map(([role, value]) => ({ name: role, value }));
  const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Platform Analytics</h1>
      <p className="mb-4 text-gray-600">Visualize platform usage, revenue, and trends.</p>
      {loading ? (
        <div className="text-center text-gray-400">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Revenue Over Time */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#FF8042" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Orders Per Restaurant */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders Per Restaurant</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByRestaurant}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#0088FE" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* User Roles Pie Chart */}
          <div className="bg-white rounded shadow p-6 col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">User Roles Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
} 