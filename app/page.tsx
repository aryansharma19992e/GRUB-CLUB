"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, ChefHat } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Grub Club
              </h1>
              <p className="text-xs text-gray-600">Thapar University</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-700 hover:text-orange-600 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-orange-600 transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-100 to-red-50">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-orange-100 text-orange-800 hover:bg-orange-100">
            🎓 Exclusively for Thapar University
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Delicious Food, Delivered Fast
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your favorite campus restaurants, all in one place. Order from the best eateries around Thapar University
            with lightning-fast delivery.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12">
            <div className="w-[350px] h-[220px] bg-gradient-to-br from-orange-200 to-red-200 rounded-xl shadow-lg flex items-center justify-center text-8xl">
              🍛
            </div>
            <div className="w-[220px] h-[220px] bg-gradient-to-br from-orange-200 to-red-200 rounded-full shadow-lg flex items-center justify-center text-8xl">
              😋
            </div>
            <div className="w-[180px] h-[180px] bg-gradient-to-br from-orange-200 to-red-200 rounded-lg shadow-lg flex items-center justify-center text-6xl">
              🍕
            </div>
          </div>
        </div>
      </section>

      {/* Food Showcase Section */}
      <section className="py-16 bg-gradient-to-r from-orange-100 via-red-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Craving Something Delicious?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="relative group">
              <div className="w-full h-48 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-xl shadow-lg flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                🍕
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold p-4">Pizza</p>
              </div>
            </div>
            <div className="relative group">
              <div className="w-full h-48 bg-gradient-to-br from-orange-200 to-red-300 rounded-xl shadow-lg flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                🍛
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold p-4">Biryani</p>
              </div>
            </div>
            <div className="relative group">
              <div className="w-full h-48 bg-gradient-to-br from-red-200 to-pink-300 rounded-xl shadow-lg flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                🍔
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold p-4">Burgers</p>
              </div>
            </div>
            <div className="relative group">
              <div className="w-full h-48 bg-gradient-to-br from-green-200 to-lime-300 rounded-xl shadow-lg flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                🥗
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white font-semibold p-4">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Why Grub Club?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg shadow bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt=""
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <ChefHat className="w-10 h-10 mx-auto text-orange-500 mb-4 relative z-10" />
              <h3 className="font-semibold text-lg mb-2 relative z-10">Top Campus Restaurants</h3>
              <p className="text-gray-600 relative z-10">
                Handpicked eateries with the best food and hygiene standards.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt=""
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <Clock className="w-10 h-10 mx-auto text-orange-500 mb-4 relative z-10" />
              <h3 className="font-semibold text-lg mb-2 relative z-10">Lightning Fast Delivery</h3>
              <p className="text-gray-600 relative z-10">Get your food delivered hot and fresh in under 30 minutes.</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <Image
                  src="/placeholder.svg?height=80&width=80"
                  alt=""
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <Star className="w-10 h-10 mx-auto text-orange-500 mb-4 relative z-10" />
              <h3 className="font-semibold text-lg mb-2 relative z-10">Loved by Students</h3>
              <p className="text-gray-600 relative z-10">
                Thousands of happy students trust Grub Club for their meals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section id="about" className="py-16 bg-orange-50 border-t">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">About Grub Club</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Grub Club is Thapar University's exclusive food delivery platform, connecting students with the best campus
            restaurants. Our mission is to make ordering food on campus fast, easy, and reliable. Enjoy a curated
            selection of eateries, lightning-fast delivery, and a seamless ordering experience—all in one place.
          </p>
          <div className="mt-8 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Grub Club. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  )
}
