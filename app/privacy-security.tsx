"use client"

import { useState } from "react"
import { StyleSheet, SafeAreaView, TouchableOpacity, Switch } from "react-native"
import { router } from "expo-router"
import { View, Text, ScrollView, Card } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"

export default function PrivacySecurityScreen() {
  const [biometricAuth, setBiometricAuth] = useState(false)
  const [autoLock, setAutoLock] = useState(true)
  const [shareLocation, setShareLocation] = useState(true)
  const [dataEncryption, setDataEncryption] = useState(true)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#DC2626" />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy & Security</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Authentication</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>Use fingerprint or face ID to unlock</Text>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto Lock</Text>
              <Text style={styles.settingDescription}>Lock app when not in use</Text>
            </View>
            <Switch
              value={autoLock}
              onValueChange={setAutoLock}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Data Privacy</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Sharing</Text>
              <Text style={styles.settingDescription}>Allow emergency contacts to see your location</Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Data Encryption</Text>
              <Text style={styles.settingDescription}>Encrypt all personal data</Text>
            </View>
            <Switch
              value={dataEncryption}
              onValueChange={setDataEncryption}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="key" size={24} color="#DC2626" />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="download" size={24} color="#DC2626" />
              <Text style={styles.menuItemText}>Download My Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="trash" size={24} color="#FF3B30" />
              <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </Card>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
  },
  settingsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#DC2626",
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
})
