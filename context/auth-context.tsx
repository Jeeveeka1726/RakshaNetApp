"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
  age?: number
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, age?: number) => Promise<boolean>
  updateProfile: (name: string, age?: number) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = "http://localhost:5500/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("accessToken")
      const storedUser = await AsyncStorage.getItem("user")

      if (storedToken && storedUser) {
        setAccessToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Error loading stored auth:", error)
    } finally {
      setLoading(false)
    }
  }

  const storeAuthData = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem("accessToken", token)
      await AsyncStorage.setItem("user", JSON.stringify(userData))
    } catch (error) {
      console.error("Error storing auth data:", error)
    }
  }

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem("accessToken")
      await AsyncStorage.removeItem("user")
    } catch (error) {
      console.error("Error clearing auth data:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        const { user: userData, accessToken: token } = data.data
        setUser(userData)
        setAccessToken(token)
        await storeAuthData(token, userData)
        return true
      } else {
        console.error("Login failed:", data.error)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string, age?: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, age }),
      })

      const data = await response.json()

      if (data.success) {
        const { user: userData, accessToken: token } = data.data
        setUser(userData)
        setAccessToken(token)
        await storeAuthData(token, userData)
        return true
      } else {
        console.error("Registration failed:", data)
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const updateProfile = async (name: string, age?: number) => {
    try {
      if (!accessToken) return false

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, age }),
      })

      const data = await response.json()

      if (data.success) {
        const updatedUser = data.data.user
        setUser(updatedUser)
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
        return true
      } else {
        console.error("Profile update failed:", data.error)
        return false
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return false
    }
  }

  const logout = async () => {
    setUser(null)
    setAccessToken(null)
    await clearAuthData()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!accessToken,
        accessToken,
        login,
        register,
        updateProfile,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
