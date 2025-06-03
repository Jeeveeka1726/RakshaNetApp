"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
  age?: number
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, age?: number) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    // In a real app, you would validate credentials against your backend
    if (email && password) {
      setUser({
        id: "1",
        name: "User",
        email,
      })
      return true
    }
    return false
  }

  const register = async (name: string, email: string, password: string, age?: number) => {
    // In a real app, you would send this data to your backend
    if (name && email && password) {
      setUser({
        id: "1",
        name,
        email,
        age,
      })
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
