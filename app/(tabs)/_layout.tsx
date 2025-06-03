import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColor } from "@/hooks/useThemeColor"

export default function TabLayout() {
  const iconColor = useThemeColor({}, "icon")
  const selectedIconColor = useThemeColor({}, "tint")
  const backgroundColor = useThemeColor({}, "background")

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: selectedIconColor,
        tabBarInactiveTintColor: iconColor,
        tabBarStyle: { backgroundColor },
        headerStyle: { backgroundColor },
        headerTintColor: selectedIconColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
