"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', price: '', category: '', preparationTime: '' });
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [hoursModalOpen, setHoursModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursMsg, setHoursMsg] = useState('');
  const [supportForm, setSupportForm] = useState({ name: '', email: '', message: '' });
  const [supportMsg, setSupportMsg] = useState('');

  // Helper to get active statuses
  const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready'];

  const handleStatusChange = async (order, nextStatus) => {
    const orderId = order._id; // Always use _id for MongoDB
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the local state immediately for instant UI update
      setPendingOrders(prevOrders => 
        prevOrders.map(prevOrder => 
          prevOrder._id === orderId 
            ? { ...prevOrder, status: nextStatus }
            : prevOrder
        )
      );

      // Also update recentOrders if it exists
      if (recentOrders) {
        setRecentOrders(prevOrders => 
          prevOrders.map(prevOrder => 
            prevOrder._id === orderId 
              ? { ...prevOrder, status: nextStatus }
              : prevOrder
          )
        );
      }

      // Show success toast
      const statusLabels = {
        'ready': 'Accepted',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered'
      };
      toast({
        title: `Order ${statusLabels[nextStatus] || nextStatus}`,
        description: `Order #${orderId.slice(-8)} status updated successfully`,
      });

      // Optional: Refresh from server to ensure consistency (in background)
      if (restaurant) {
        fetch(`/api/orders?restaurantId=${restaurant._id || restaurant.id}&status=pending,ready,out_for_delivery`)
          .then(res => res.json())
          .then(data => {
            // Only update if there are actual changes
            if (JSON.stringify(data.orders) !== JSON.stringify(pendingOrders)) {
              setPendingOrders(data.orders || []);
            }
          })
          .catch(err => console.log('Background refresh failed:', err));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Show error toast
      toast({
        title: 'Update Failed',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

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

  const fetchMenuItems = async () => {
    if (!restaurant) return;
    setMenuLoading(true);
    setMenuError('');
    try {
      const res = await fetch(`/api/restaurants/${restaurant._id || restaurant.id}`);
      const data = await res.json();
      setMenuItems(Object.values(data.menu).flat());
    } catch (e) {
      setMenuError('Failed to fetch menu items');
    }
    setMenuLoading(false);
  };

  const handleDeleteMenuItem = async (id) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    await fetch(`/api/menu-items/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    fetchMenuItems();
  };

  const handleAddMenuItem = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    await fetch('/api/menu-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...newMenuItem, price: Number(newMenuItem.price), restaurantId: restaurant._id || restaurant.id }),
    });
    setNewMenuItem({ name: '', description: '', price: '', category: '', preparationTime: '' });
    fetchMenuItems();
  };

  const handleUpdateHours = async () => {
    if (!restaurant) return;
    setHoursSaving(true);
    setHoursMsg('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`/api/restaurants/${restaurant._id || restaurant.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ openingHours: hoursInput }),
    });
    if (res.ok) {
      setHoursMsg('Hours updated!');
      setRestaurant({ ...restaurant, openingHours: hoursInput });
    } else {
      setHoursMsg('Failed to update hours');
    }
    setHoursSaving(false);
  };

  useEffect(() => {
    if (!user) return;
    console.log('Current user:', user);
    fetch(`/api/restaurants?ownerId=${user._id || user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched restaurants:', data.restaurants);
        const rest = data.restaurants && data.restaurants.length > 0 ? data.restaurants[0] : null;
        setRestaurant(rest);
        if (rest) {
          // Fetch all active orders for this restaurant
          fetch(`/api/orders?restaurantId=${rest._id || rest.id}&status=pending,ready,out_for_delivery`)
            .then(res => res.json())
            .then(data => setPendingOrders(data.orders || []));
          // Fetch 5 most recent orders for this restaurant
          fetch(`/api/orders?restaurantId=${rest._id || rest.id}&limit=5`)
            .then(res => res.json())
            .then(data => setRecentOrders(data.orders || []));
          // Fetch all orders for this restaurant for stats
          fetch(`/api/orders?restaurantId=${rest._id || rest.id}&limit=1000`)
            .then(res => res.json())
            .then(data => setAllOrders(data.orders || []));
        }
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {restaurant?.name ? restaurant.name.toUpperCase() : 'Restaurant Dashboard'}
          </h1>
          <p className="text-gray-600">Manage your restaurant and orders</p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p>Loading restaurant data...</p>
          </div>
        )}

        {!restaurant && !loading && (
          <div className="text-red-600 font-bold text-center my-8">
            No restaurant found for this owner. Please check your registration or contact support.<br/>
            (Debug: userId = {user?._id || user?.id})
          </div>
        )}

      

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allOrders.length}</div>
              <p className="text-xs text-muted-foreground">Total from database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{allOrders.reduce((sum, o) => sum + (o.total || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">Total from database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurant Status</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Open</div>
              <p className="text-xs text-muted-foreground">Accepting orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-gray-500 text-sm">No recent orders found.</div>
                ) : (
                  // Sort orders to show pending and active orders first
                  [...recentOrders].sort((a, b) => {
                    const isPendingA = a.status === 'pending' || a.status === 'ready' || a.status === 'out_for_delivery';
                    const isPendingB = b.status === 'pending' || b.status === 'ready' || b.status === 'out_for_delivery';
                    if (isPendingA && !isPendingB) return -1;
                    if (!isPendingA && isPendingB) return 1;
                    return 0;
                  }).map((order) => {
                    const statusInfo = getStatusLabel(order.status);
                    let nextStatus = null;
                    let buttonLabel = '';
                    if (order.status === 'pending') {
                      nextStatus = 'ready';
                      buttonLabel = 'Accept';
                    } else if (order.status === 'ready') {
                      nextStatus = 'out_for_delivery';
                      buttonLabel = 'Out for Delivery';
                    }
                    return (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-l-orange-500 hover:shadow-md transition-all">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
                            <Badge variant="secondary" className={statusInfo.color}>{statusInfo.label}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            {order.items.map(item => item.name).join(', ')}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Customer: {order.customerName} ({order.customerPhone})
                          </p>
                          <p className="text-xs text-gray-500">
                            Address: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}
                          </p>
                          {nextStatus && (
                            <div className="mt-2 text-xs text-blue-600">
                              Next: {buttonLabel} → {getStatusLabel(nextStatus).label}
                            </div>
                          )}
                          {/* Status Flow Indicator */}
                          <div className="mt-3 flex items-center space-x-2">
                            {['pending', 'ready', 'out_for_delivery', 'delivered'].map((status, index) => (
                              <div key={status} className="flex items-center">
                                <div className={`w-2 h-2 rounded-full ${
                                  order.status === status 
                                    ? 'bg-orange-500' 
                                    : ['pending', 'ready', 'out_for_delivery'].includes(order.status) && ['pending', 'ready', 'out_for_delivery'].indexOf(status) <= ['pending', 'ready', 'out_for_delivery'].indexOf(order.status)
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`} />
                                {index < 3 && (
                                  <div className={`w-4 h-1 mx-1 ${
                                    ['pending', 'ready', 'out_for_delivery'].includes(order.status) && ['pending', 'ready', 'out_for_delivery'].indexOf(status) < ['pending', 'ready', 'out_for_delivery'].indexOf(order.status)
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                  }`} />
                                )}
                              </div>
                            ))}
                            <span className="text-xs text-gray-500 ml-2">
                              {order.status === 'pending' && 'Order Placed'}
                              {order.status === 'ready' && 'Accepted'}
                              {order.status === 'out_for_delivery' && 'On the Way'}
                              {order.status === 'delivered' && 'Delivered'}
                            </span>
                          </div>
                        </div>
                        {nextStatus && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleStatusChange(order, nextStatus)} 
                            disabled={actionLoading[order._id]}
                            className="ml-4 min-w-[100px] hover:bg-orange-50 hover:border-orange-300"
                          >
                            {actionLoading[order._id] ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                                Updating...
                              </div>
                            ) : (
                              buttonLabel
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline" onClick={() => { setMenuModalOpen(true); fetchMenuItems(); }}>
                  Manage Menu
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setAnalyticsModalOpen(true)}>
                  View Analytics
                </Button>
                <Button className="w-full" variant="outline" onClick={() => { setHoursInput(restaurant?.openingHours || ''); setHoursModalOpen(true); }}>
                  Update Hours
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setSupportModalOpen(true)}>
                  Customer Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {menuModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setMenuModalOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4">Manage Menu</h2>
            {menuLoading ? <div>Loading...</div> : menuError ? <div className="text-red-500">{menuError}</div> : (
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {menuItems.map(item => (
                  <div key={item._id} className="flex items-center justify-between border p-2 rounded">
                    <div>
                      <div className="font-semibold">{item.name} <span className="text-xs text-gray-400">({item.category})</span></div>
                      <div className="text-xs text-gray-500">₹{item.price} - {item.preparationTime}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteMenuItem(item._id)}>Delete</Button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Add New Item</h3>
              <input className="border p-1 mb-1 w-full" placeholder="Name" value={newMenuItem.name} onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })} />
              <input className="border p-1 mb-1 w-full" placeholder="Description" value={newMenuItem.description} onChange={e => setNewMenuItem({ ...newMenuItem, description: e.target.value })} />
              <input className="border p-1 mb-1 w-full" placeholder="Price" type="number" value={newMenuItem.price} onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })} />
              <input className="border p-1 mb-1 w-full" placeholder="Category" value={newMenuItem.category} onChange={e => setNewMenuItem({ ...newMenuItem, category: e.target.value })} />
              <input className="border p-1 mb-2 w-full" placeholder="Preparation Time" value={newMenuItem.preparationTime} onChange={e => setNewMenuItem({ ...newMenuItem, preparationTime: e.target.value })} />
              <Button className="w-full" onClick={handleAddMenuItem}>Add Item</Button>
            </div>
          </div>
        </div>
      )}
      {analyticsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setAnalyticsModalOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <div className="mb-2">Total Orders: <span className="font-semibold">{allOrders.length}</span></div>
            <div className="mb-2">Total Revenue: <span className="font-semibold">₹{allOrders.reduce((sum, o) => sum + (o.total || 0), 0)}</span></div>
            <div className="mb-4">Orders by Status:</div>
            <div className="space-y-2 mb-4">
              {['pending', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(status => {
                const count = allOrders.filter(o => o.status === status).length;
                return (
                  <div key={status} className="flex items-center">
                    <div className="w-32 capitalize">{status.replace(/_/g, ' ')}</div>
                    <div className="flex-1 bg-gray-100 h-4 rounded mx-2">
                      <div className="bg-blue-500 h-4 rounded" style={{ width: `${Math.max(5, (count / (allOrders.length || 1)) * 100)}%` }}></div>
                    </div>
                    <div className="w-8 text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {hoursModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setHoursModalOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4">Update Hours</h2>
            <input className="border p-2 w-full mb-2" value={hoursInput} onChange={e => setHoursInput(e.target.value)} placeholder="e.g. 10:00-22:00" />
            <Button className="w-full mb-2" onClick={handleUpdateHours} disabled={hoursSaving}>{hoursSaving ? 'Saving...' : 'Save'}</Button>
            {hoursMsg && <div className="text-green-600 text-sm">{hoursMsg}</div>}
          </div>
        </div>
      )}
      {supportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSupportModalOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4">Customer Support</h2>
            <div className="mb-2">For urgent issues, email <a href="mailto:support@grubclub.com" className="text-blue-600 underline">support@grubclub.com</a></div>
            <div className="mb-2">Or send us a message:</div>
            <input className="border p-1 mb-1 w-full" placeholder="Your Name" value={supportForm.name} onChange={e => setSupportForm({ ...supportForm, name: e.target.value })} />
            <input className="border p-1 mb-1 w-full" placeholder="Your Email" value={supportForm.email} onChange={e => setSupportForm({ ...supportForm, email: e.target.value })} />
            <textarea className="border p-1 mb-2 w-full" placeholder="Message" value={supportForm.message} onChange={e => setSupportForm({ ...supportForm, message: e.target.value })} />
            <Button className="w-full" onClick={() => setSupportMsg('Message sent! (UI only)')}>Send</Button>
            {supportMsg && <div className="text-green-600 text-sm mt-2">{supportMsg}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
