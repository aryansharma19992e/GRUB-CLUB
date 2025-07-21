"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  role: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token')
    const storedUserData = localStorage.getItem('userData')
    
    console.log('🔍 AuthContext: Checking for stored token:', storedToken ? 'Found' : 'Not found')
    console.log('🔍 AuthContext: Checking for stored user data:', storedUserData ? 'Found' : 'Not found')
    
    if (storedToken) {
      setToken(storedToken)
      
      // If we have stored user data, use it immediately
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          console.log('✅ Using stored user data:', userData)
          setUser(userData)
          setLoading(false)
        } catch (error) {
          console.log('❌ Failed to parse stored user data, fetching from API')
          fetchUserProfile(storedToken)
        }
      } else {
        fetchUserProfile(storedToken)
      }
    } else {
      console.log('🔍 AuthContext: No token found, setting loading to false')
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log('🔍 Fetching user profile with token:', authToken.substring(0, 20) + '...')
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ User data received:', data.user)
        setUser(data.user)
      } else {
        console.log('❌ Failed to fetch user profile:', response.status)
        
        // Try to decode token for basic info as fallback
        try {
          const tokenData = JSON.parse(atob(authToken.split('.')[1]))
          console.log('🔍 Token data:', tokenData)
          
          // Check if we have stored user data first
          const storedUserData = localStorage.getItem('userData')
          if (storedUserData) {
            try {
              const parsedUserData = JSON.parse(storedUserData)
              console.log('✅ Using stored user data as fallback:', parsedUserData)
              setUser(parsedUserData)
            } catch (parseError) {
              console.error('❌ Failed to parse stored user data:', parseError)
              // Fall back to token data
              const basicUser = {
                id: tokenData.userId,
                name: 'User', // We'll get this from registration data
                email: tokenData.email,
                phone: '',
                address: '',
                role: tokenData.role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              console.log('✅ Using basic user data from token:', basicUser)
              setUser(basicUser)
            }
          } else {
            // Create basic user object from token
            const basicUser = {
              id: tokenData.userId,
              name: 'User', // We'll get this from registration data
              email: tokenData.email,
              phone: '',
              address: '',
              role: tokenData.role,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            console.log('✅ Using basic user data from token:', basicUser)
            setUser(basicUser)
          }
        } catch (tokenError) {
          console.error('❌ Failed to decode token:', tokenError)
          // Token is invalid, clear it
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      
      // Try fallback token decoding
      try {
        const tokenData = JSON.parse(atob(authToken.split('.')[1]))
        const basicUser = {
          id: tokenData.userId,
          name: 'User',
          email: tokenData.email,
          phone: '',
          address: '',
          role: tokenData.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setUser(basicUser)
      } catch (tokenError) {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 Attempting login for email:', email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('📡 Login response:', data)

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token)
        // Store user data for login as well
        localStorage.setItem('userData', JSON.stringify(data.user))
        console.log('✅ Login successful, stored user data:', data.user)
        setToken(data.token)
        setUser(data.user)
        return true
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      console.log('🔍 Registering user with data:', userData)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      console.log('📡 Registration response:', data)

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token)
        // Also store user data as backup
        localStorage.setItem('userData', JSON.stringify(data.user))
        console.log('✅ Stored user data:', data.user)
        setToken(data.token)
        setUser(data.user)
        return true
      } else {
        throw new Error(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 