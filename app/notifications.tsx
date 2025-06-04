"use client"

import { useState } from "react"
import { StyleSheet, SafeAreaView, TouchableOpacity, Switch } from "react-native"
import { router } from "expo-router"
import { View, Text, ScrollView, Card } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"

export default function NotificationsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true)
  const [sosAlerts, setSosAlerts] = useState(true)
  const [emergencyUpdates, setEmergencyUpdates] = useState(true)
  const [locationSharing, setLocationSharing] = useState(false)
  const [soundAlerts, setSoundAlerts] = useState(true)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#DC2626" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications on your device</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>SOS Alerts</Text>
              <Text style={styles.settingDescription}>Get notified when SOS is triggered</Text>
            </View>
            <Switch
              value={sosAlerts}
              onValueChange={setSosAlerts}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Emergency Updates</Text>
              <Text style={styles.settingDescription}>Receive emergency alerts in your area</Text>
            </View>
            <Switch
              value={emergencyUpdates}
              onValueChange={setEmergencyUpdates}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Sharing Alerts</Text>
              <Text style={styles.settingDescription}>Notify when location is shared</Text>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sound Alerts</Text>
              <Text style={styles.settingDescription}>Play sound for emergency notifications</Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: "#767577", true: "#DC2626" }}
              thumbColor="#f4f3f4"
            />
          </View>
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
})
