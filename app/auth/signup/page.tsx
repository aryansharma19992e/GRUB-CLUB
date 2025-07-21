"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChefHat, User, Store, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export default function SignupPage() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState(searchParams.get("role") || "")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    restaurantName: "",
    address: "",
  })
  const [inviteCode, setInviteCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        // Always send role as 'restaurant_owner' if role is 'restaurant'
        role: role === 'restaurant' ? 'restaurant_owner' : role,
        ...(role === 'restaurant' && {
          address: formData.address,
          restaurantName: formData.restaurantName,
          inviteCode,
        }),
        ...(role === 'admin' && { adminCode }),
      }

      console.log('Sending payload:', payload)

      const success = await register(payload)

      if (success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        })

        // Redirect based on role
        if (role === "user") {
          router.push("/dashboard/user")
        } else if (role === "restaurant") {
          router.push("/dashboard/restaurant")
        } else if (role === "admin") {
          router.push("/dashboard/admin")
        }
      } else {
        throw new Error("Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "user":
        return <User className="w-5 h-5" />
      case "restaurant":
        return <Store className="w-5 h-5" />
      case "admin":
        return <Shield className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Grub Club
            </span>
          </div>
          <CardTitle className="text-2xl">Join Grub Club</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Sign up as</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Student/User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="restaurant">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4" />
                      <span>Restaurant Owner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'restaurant' && (
              <div className="mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">Invite Code</label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Enter your unique code"
                  required
                />
              </div>
            )}

            {role === 'admin' && (
              <div className="mb-4">
                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">Admin Code</label>
                <input
                  id="adminCode"
                  type="text"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Enter the admin code"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{role === "restaurant" ? "Owner Name" : "Full Name"}</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {role === "restaurant" && (
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  type="text"
                  placeholder="Enter restaurant name"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@thapar.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {role === "restaurant" && (
              <div className="space-y-2">
                <Label htmlFor="address">Restaurant Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter restaurant address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={!role || isLoading}
            >
              {isLoading ? "Signing Up..." : (role && getRoleIcon(role))}
              <span className="ml-2">Create Account</span>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
