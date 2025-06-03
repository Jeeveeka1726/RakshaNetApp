"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme as useDeviceColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

type ThemeType = "light" | "dark" | "system"
type ThemeContextType = {
  theme: ThemeType
  colorScheme: "light" | "dark"
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "rakshanet-theme-preference"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme() || "light"
  const [theme, setThemeState] = useState<ThemeType>("system")

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType)
        }
      } catch (error) {
        console.log("Error loading theme", error)
      }
    }

    loadTheme()
  }, [])

  // Save theme preference when it changes
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.log("Error saving theme", error)
    }
  }

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const currentTheme = theme === "system" ? deviceColorScheme : theme
    setTheme(currentTheme === "light" ? "dark" : "light")
  }

  // Determine the actual color scheme based on theme setting
  const colorScheme = theme === "system" ? deviceColorScheme : theme

  return <ThemeContext.Provider value={{ theme, colorScheme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
