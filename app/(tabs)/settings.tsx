"use client"

import React from "react"
import { StyleSheet, SafeAreaView, Switch, TouchableOpacity } from "react-native"
import { View, Text, Card, ScrollView } from "@/components/themed"
import { useAuth } from "@/context/auth-context"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import ThemeToggle from "@/components/ThemeToggle"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useTheme } from "@/context/theme-context"

export default function SettingsScreen() {
  const { logout, user } = useAuth()
  const { colorScheme } = useTheme()
  const textColor = useThemeColor({}, "text")

  const [shakeDetection, setShakeDetection] = React.useState(true)
  const [voiceActivation, setVoiceActivation] = React.useState(true)
  const [autoLocation, setAutoLocation] = React.useState(true)

  const handleLogout = () => {
    logout()
    router.replace("/")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <ThemeToggle />
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={60} color="#0a7ea4" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "User"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                {colorScheme === "dark" ? "Currently using dark theme" : "Currently using light theme"}
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Safety Settings</Text>

        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Shake Detection</Text>
              <Text style={styles.settingDescription}>Activate SOS by shaking your phone</Text>
            </View>
            <Switch
              value={shakeDetection}
              onValueChange={setShakeDetection}
              trackColor={{ false: "#767577", true: "#0a7ea4" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Voice Activation</Text>
              <Text style={styles.settingDescription}>Say "Raksha" to trigger SOS</Text>
            </View>
            <Switch
              value={voiceActivation}
              onValueChange={setVoiceActivation}
              trackColor={{ false: "#767577", true: "#0a7ea4" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto Location Sharing</Text>
              <Text style={styles.settingDescription}>Share location automatically during SOS</Text>
            </View>
            <Switch
              value={autoLocation}
              onValueChange={setAutoLocation}
              trackColor={{ false: "#767577", true: "#0a7ea4" }}
              thumbColor="#f4f3f4"
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Account</Text>

        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/contacts")}>
            <View style={styles.menuItemContent}>
              <Ionicons name="people" size={24} color="#0a7ea4" />
              <Text style={styles.menuItemText}>Emergency Contacts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="notifications" size={24} color="#0a7ea4" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="shield" size={24} color="#0a7ea4" />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="help-circle" size={24} color="#0a7ea4" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>RakshaNet v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  editProfileButton: {
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editProfileText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    marginBottom: 20,
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 20,
  },
})
