"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingCart, ChefHat, User, Heart, Share2 } from "lucide-react"
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch restaurant")
        return res.json()
      })
      .then((data) => {
        setRestaurant(data.restaurant)
        setMenu(data.menu)
        setCategories(data.categories)
        setActiveCategory(data.categories[0] || "")
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [restaurantId])

  if (loading) return <div className="text-center py-12">Loading restaurant...</div>
  if (error || !restaurant) return <div className="text-center py-12 text-red-500">Restaurant not found</div>

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0)
  }

  const getTotalPrice = () => {
    // menu is an object: { categoryName: [items] }
    const allItems = Object.values(menu).flat();
    return Object.entries(cart).reduce((total, [itemId, count]) => {
      const item = allItems.find((item) => String(item._id || item.id) === itemId);
      return total + (item ? item.price * count : 0);
    }, 0);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Grub Club
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info */}
      <div className="relative">
        <Image
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          width={600}
          height={300}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-lg opacity-90 mb-2">{restaurant.description}</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>
                {restaurant.rating} ({restaurant.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Menu Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">Menu Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeCategory === category
                          ? "bg-orange-100 text-orange-700 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            {Object.entries(menu).map(([categoryName, items]) => (
              <div key={categoryName} className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{categoryName}</h2>
                <div className="grid gap-4">
                  {Array.isArray(items) && items.map((item) => (
                    <Card key={item._id || item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-bold text-lg">{item.name}</h3>
                                  {item.veg ? (
                                    <div className="w-4 h-4 border-2 border-green-500 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-red-500 flex items-center justify-center">
                                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    </div>
                                  )}
                                  {item.popular && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                <p className="font-bold text-lg text-gray-900">₹{item.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end">
                              {user && (
                                cart[item._id || item.id] ? (
                                  <div className="flex items-center space-x-3 bg-orange-100 rounded-lg px-3 py-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeFromCart(item._id || item.id)}
                                      className="h-8 w-8 p-0 hover:bg-orange-200"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="font-medium text-orange-700 min-w-[20px] text-center">
                                      {cart[item._id || item.id]}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addToCart(item._id || item.id)}
                                      className="h-8 w-8 p-0 hover:bg-orange-200"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => addToCart(item._id || item.id)}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{getTotalItems()} items</div>
                    <div className="text-sm opacity-90">₹{getTotalPrice()}</div>
                  </div>
                </div>
                <Link href="/cart">
                  <Button className="bg-white text-orange-600 hover:bg-gray-100">View Cart</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
