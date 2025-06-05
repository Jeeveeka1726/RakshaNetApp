"use client"
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native"
import { View, Text, Card, ScrollView } from "@/components/themed"
import SOSButton from "@/components/SOSButton"
import ThemeToggle from "@/components/ThemeToggle"
import { useAuth } from "@/context/auth-context"
import { Ionicons } from "@expo/vector-icons"
import NearbyStationsWithModal from "@/components/NearbyStation" // ✅ NEW

export default function DashboardScreen() {
  const { user } = useAuth()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || "User"}</Text>
            <Text style={styles.subtitle}>Stay safe with RakshaNet</Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={styles.sosContainer}>
          <SOSButton />
          {/* ✅ Replacing button + modal with this */}
          <NearbyStationsWithModal />
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={22} color="#0a7ea4" />
            <Text style={styles.infoTitle}>Quick Activation</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="mic" size={18} color="#0a7ea4" />
            <Text style={styles.featureText}>
              Say &quot;Raksha&quot; loudly to activate SOS
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="phone-portrait" size={18} color="#0a7ea4" />
            <Text style={styles.featureText}>
              Shake your phone vigorously to trigger alert
            </Text>
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
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  sosContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  infoCard: {
    padding: 16,
    marginTop: 20,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
})