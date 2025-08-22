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
        <div className="container mx-auto px-3 lg:px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="touch-target">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <ChefHat className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Grub Club
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" size="sm" onClick={async () => {
                try {
                  const res = await fetch('/api/user/favorites', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify({ restaurantId }),
                  })
                  if (!res.ok) throw new Error('Failed to add favorite')
                } catch (e) {
                  console.error(e)
                }
              }} className="touch-target">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="touch-target">
                <Share2 className="w-4 h-4" />
              </Button>
              <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  <User className="w-3 h-3 lg:w-4 lg:h-4" />
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
          className="w-full h-48 lg:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-sm lg:text-lg opacity-90 mb-2 line-clamp-2">{restaurant.description}</p>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
              <span>
                {restaurant.rating} ({restaurant.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{restaurant.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{restaurant.distance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Menu Categories Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-1">
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

          {/* Mobile Category Selector - Horizontal scroll on mobile */}
          <div className="lg:hidden mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items - Full width on mobile */}
          <div className="lg:col-span-3">
            {Object.entries(menu).map(([categoryName, items]) => (
              <div key={categoryName} className="mb-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-900">{categoryName}</h2>
                <div className="grid gap-3 lg:gap-4">
                  {Array.isArray(items) && items.map((item) => (
                    <Card key={item._id || item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-bold text-base lg:text-lg">{item.name}</h3>
                                  {item.popular && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-xs lg:text-sm mb-2">{item.description}</p>
                                <p className="font-bold text-base lg:text-lg text-gray-900">₹{item.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end mt-3">
                              {user && (
                                cart[item._id || item.id] ? (
                                  <div className="flex items-center space-x-2 lg:space-x-3 bg-orange-100 rounded-lg px-2 lg:px-3 py-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeFromCart(item._id || item.id)}
                                      className="h-7 w-7 lg:h-8 lg:w-8 p-0 hover:bg-orange-200"
                                    >
                                      <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </Button>
                                    <span className="font-medium text-orange-700 min-w-[16px] lg:min-w-[20px] text-center text-sm lg:text-base">
                                      {cart[item._id || item.id]}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addToCart(item._id || item.id)}
                                      className="h-7 w-7 lg:h-8 lg:w-8 p-0 hover:bg-orange-200"
                                    >
                                      <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => addToCart(item._id || item.id)}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm lg:text-base px-3 lg:px-4 py-2"
                                  >
                                    <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
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
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{getTotalItems()} items</div>
                    <div className="text-xs lg:text-sm opacity-90">₹{getTotalPrice()}</div>
                  </div>
                </div>
                <Link href="/cart">
                  <Button className="bg-white text-orange-600 hover:bg-gray-100 text-sm lg:text-base px-3 lg:px-4 py-2">
                    View Cart
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
