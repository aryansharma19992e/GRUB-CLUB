"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  Search,
  Star,
  Clock,
  MapPin,
  Heart,
  Trash2,
  Eye
} from "lucide-react"
import Link from "next/link"

interface FavoriteRestaurant {
  id: string
  name: string
  description: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: string
  minOrder: string
  image: string
  tags: string[]
  isOpen: boolean
  addedDate: string
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockFavorites: FavoriteRestaurant[] = [
      {
        id: "1",
        name: "Spice Garden",
        description: "Authentic Indian cuisine with a modern twist",
        cuisine: "Indian",
        rating: 4.5,
        deliveryTime: "25-35 min",
        deliveryFee: "₹30",
        minOrder: "₹150",
        image: "/placeholder.jpg",
        tags: ["Vegetarian", "Spicy", "Popular"],
        isOpen: true,
        addedDate: "2024-11-15T00:00:00Z"
      },
      {
        id: "3",
        name: "Royal Kitchen",
        description: "Traditional Mughlai and North Indian dishes",
        cuisine: "Indian",
        rating: 4.7,
        deliveryTime: "20-30 min",
        deliveryFee: "₹25",
        minOrder: "₹180",
        image: "/placeholder.jpg",
        tags: ["Mughlai", "Biryani", "Popular"],
        isOpen: true,
        addedDate: "2024-11-20T00:00:00Z"
      },
      {
        id: "5",
        name: "Chinese Wok",
        description: "Authentic Chinese cuisine with fresh ingredients",
        cuisine: "Chinese",
        rating: 4.3,
        deliveryTime: "35-45 min",
        deliveryFee: "₹45",
        minOrder: "₹250",
        image: "/placeholder.jpg",
        tags: ["Chinese", "Noodles", "Spicy"],
        isOpen: true,
        addedDate: "2024-12-01T00:00:00Z"
      }
    ]

    setFavorites(mockFavorites)
    setLoading(false)
  }, [])

  const filteredFavorites = favorites.filter(restaurant => {
    return restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const removeFavorite = (restaurantId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== restaurantId))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
                <p className="text-gray-600">Your favorite restaurants and quick access</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-gray-600">
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
              </span>
            </div>
            {searchTerm && (
              <span className="text-gray-600">
                • {filteredFavorites.length} result{filteredFavorites.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((restaurant) => (
              <Card key={restaurant.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                        {restaurant.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mb-3">
                        {restaurant.description}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFavorite(restaurant.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{restaurant.deliveryFee}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Min. order: <span className="font-medium">{restaurant.minOrder}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {restaurant.isOpen ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Closed
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Added on {formatDate(restaurant.addedDate)}
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Link href={`/restaurant/${restaurant.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Menu
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Order Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No favorites found' : 'No favorites yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Start adding restaurants to your favorites for quick access'
              }
            </p>
            <Link href="/restaurants/browse">
              <Button>
                Browse Restaurants
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <div className="mt-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your favorites and discover new restaurants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link href="/restaurants/browse">
                    <Button variant="outline">
                      Discover More
                    </Button>
                  </Link>
                  <Button variant="outline">
                    Share Favorites
                  </Button>
                  <Button variant="outline">
                    Export List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 