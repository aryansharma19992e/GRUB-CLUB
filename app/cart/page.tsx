"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Minus, Trash2, MapPin, Clock, CreditCard, Wallet, ChefHat } from "lucide-react"
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth ? useAuth() : { user: null };
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError('');
      try {
        const itemIds = Object.keys(cart);
        if (itemIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        const res = await fetch('/api/menu-items?ids=' + itemIds.join(','));
        if (!res.ok) throw new Error('Failed to fetch cart items');
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (err) {
        setError(err.message || 'Error fetching cart items');
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [cart]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (cart[item._id || item.id] || 0), 0);
  const deliveryFee = 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  // Helper: group items by restaurantId (assuming all items are from one restaurant for now)
  const restaurantId = cartItems.length > 0 ? cartItems[0].restaurantId : null;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({ title: 'Please log in to place an order.' });
      return;
    }
    if (!restaurantId) {
      toast({ title: 'No restaurant found for order.' });
      return;
    }
    setPlacingOrder(true);
    try {
      const orderItems = cartItems.map(item => ({
        menuItemId: item._id || item.id,
        quantity: cart[item._id || item.id] || 1,
      }));
      const orderBody = {
        userId: String(user._id || user.id),
        restaurantId: String(restaurantId),
        items: orderItems,
        deliveryAddress: {
          street: 'Thapar University, Hostel Block A',
          city: 'Patiala',
          state: 'Punjab',
          zipCode: '147004',
        },
        paymentMethod: 'cash',
      };
      console.log('Order API request body:', orderBody);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Order API error:', data, 'Status:', res.status);
        throw new Error(data.error || 'Failed to place order');
      }
      setOrderPlaced(true);
      clearCart();
      toast({ title: 'Order placed successfully!', description: 'Your food is on its way.' });
    } catch (err) {
      toast({ title: err.message || 'Failed to place order', description: '', });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/user">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Your Cart
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Thapar University, Hostel Block A</p>
                    <p className="text-sm text-gray-600">Patiala, Punjab 147004</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading cart...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <Link href="/restaurants">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        Browse Restaurants
                      </Button>
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id || item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{item.name}</h3>
                              {item.isVegetarian ? (
                                <div className="w-3 h-3 border border-green-500 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                </div>
                              ) : (
                                <div className="w-3 h-3 border border-red-500 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{item.restaurantName || ''}</p>
                            <p className="font-medium text-gray-900">₹{item.price}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item._id || item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-3 py-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item._id || item.id)}
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-medium min-w-[20px] text-center">{cart[item._id || item.id]}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToCart(item._id || item.id)}
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="font-bold text-lg">₹{item.price * (cart[item._id || item.id] || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          {/* Order Summary */}
          {cartItems.length > 0 && !loading && !error && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-green-600">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees</span>
                      <span>₹{taxes}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Estimated delivery: 15-20 mins</span>
                    </div>
                    {orderPlaced ? (
                      <div className="text-center py-8 text-green-600">
                        Order placed successfully! Your food is on its way.
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-6"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                      >
                        {placingOrder ? 'Placing Order...' : 'Place Order'}
                      </Button>
                    )}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        By placing this order, you agree to our Terms & Conditions
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment Options</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <span className="text-sm ml-6">Cash on Delivery</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
