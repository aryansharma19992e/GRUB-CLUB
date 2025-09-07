"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  MapPin,
  Package,
  Star,
  Filter,
  Eye,
  Repeat
} from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id?: string;
  id?: string;
  orderNumber: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderTime?: Date;
  createdAt?: Date;
  actualDeliveryTime?: Date;
  estimatedDeliveryTime?: Date;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | string;
  rating?: number;
}

export default function OrderHistory() {
  const { user } = useAuth();
  const { addToCart, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/orders?userId=${user._id || user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.restaurantName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.orderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === "all" || order.status === statusFilter;
  return matchesSearch && matchesStatus;
});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'preparing':
        return 'bg-orange-100 text-orange-800'
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      case 'preparing':
        return 'Preparing'
      case 'out_for_delivery':
        return 'Out for Delivery'
      default:
        return status
    }
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/user">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-600">Track all your past orders and deliveries</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by restaurant or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, idx) => (
            <Card key={order.id || order._id || order.orderNumber || idx} className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{order.restaurantName}</h3>
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Order #{order.orderNumber}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Ordered: {formatDate(order.orderTime || order.createdAt)}</span>
                      </div>
                      {order.status === 'delivered' && order.actualDeliveryTime && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Delivered: {formatDate(order.actualDeliveryTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">₹{order.total}</div>
                    {order.rating && (
                      <div className="flex items-center justify-end">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{order.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Items:</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, index) => (
                        <Badge key={item.menuItemId || item._id || index} variant="outline" className="text-sm">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} ${order.deliveryAddress?.zipCode || ''}`}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            // Clear existing cart
                            clearCart();
                            
                            // Add all items from the order to cart
                            for (const item of order.items) {
                              if (item.menuItemId) {
                                await addToCart(item.menuItemId);
                              }
                            }
                            
                            // Navigate to cart
                            router.push('/cart');
                            
                            toast({
                              title: "Items added to cart",
                              description: "Your reorder has been added to cart successfully!",
                            });
                          } catch (error) {
                            console.error('Reorder error:', error);
                            toast({
                              title: "Reorder failed",
                              description: "Could not add items to cart. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Link href="/restaurants/browse">
              <Button>
                Browse Restaurants
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <h4 className="font-medium">Restaurant</h4>
                <p className="text-sm text-gray-700">{selectedOrder.restaurantName}</p>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Order Status</h4>
                <Badge variant="secondary" className={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Badge>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Items Ordered</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="text-gray-600">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Delivery Address</h4>
                <p className="text-sm text-gray-700">
                  {typeof selectedOrder.deliveryAddress === 'string' 
                    ? selectedOrder.deliveryAddress 
                    : `${selectedOrder.deliveryAddress?.street || ''}, ${selectedOrder.deliveryAddress?.city || ''}, ${selectedOrder.deliveryAddress?.state || ''} ${selectedOrder.deliveryAddress?.zipCode || ''}`
                  }
                </p>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Order Timeline</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Ordered:</span>
                    <span>{formatDate(selectedOrder.orderTime || selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.status === 'delivered' && selectedOrder.actualDeliveryTime && (
                    <div className="flex justify-between">
                      <span>Delivered:</span>
                      <span>{formatDate(selectedOrder.actualDeliveryTime)}</span>
                    </div>
                  )}
                  {selectedOrder.estimatedDeliveryTime && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <div className="flex justify-between">
                      <span>Estimated Delivery:</span>
                      <span>{formatDate(selectedOrder.estimatedDeliveryTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Total Amount</h4>
                <p className="text-xl font-bold">₹{selectedOrder.total}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 