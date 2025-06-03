"use client"

import { TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/theme-context"
import { useThemeColor } from "@/hooks/useThemeColor"

export default function ThemeToggle() {
  const { colorScheme, toggleTheme } = useTheme()
  const iconColor = useThemeColor({}, "text")

  const isDark = colorScheme === "dark"

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={iconColor} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
})
