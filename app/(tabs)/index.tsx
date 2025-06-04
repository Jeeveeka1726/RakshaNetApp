"use client"
import { StyleSheet, SafeAreaView, Modal, TouchableWithoutFeedback, TouchableOpacity } from "react-native"
import { View, Text, Card, ScrollView } from "@/components/themed"
import SOSButton from "@/components/SOSButton"
import ThemeToggle from "@/components/ThemeToggle"
import { useAuth } from "@/context/auth-context"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import NearbyStation from "@/components/NearbyStation"

export default function DashboardScreen() {
  const { user } = useAuth()
  const [showPoliceStations, setShowPoliceStations] = useState(false)

  // Mock police station data
  const policeStations = [
    { id: 1, name: "Central Police Station", distance: "0.5 km", address: "Main Street, City Center" },
    { id: 2, name: "North Police Station", distance: "1.2 km", address: "North Avenue, Sector 5" },
    { id: 3, name: "East Police Station", distance: "2.1 km", address: "East Road, Block A" },
  ]

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
          <TouchableOpacity style={styles.policeStationButton} onPress={() => setShowPoliceStations(true)}>
            <Ionicons name="shield" size={24} color="#DC2626" />
            <Text style={styles.policeStationText}>Nearby Police Stations</Text>
            <Ionicons name="chevron-forward" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={22} color="#0a7ea4" />
            <Text style={styles.infoTitle}>Quick Activation</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="mic" size={18} color="#0a7ea4" />
            <Text style={styles.featureText}>Say &quot;Raksha&quot; loudly to activate SOS</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="phone-portrait" size={18} color="#0a7ea4" />
            <Text style={styles.featureText}>Shake your phone vigorously to trigger alert</Text>
          </View>
        </Card>
        <Modal
          visible={showPoliceStations}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPoliceStations(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowPoliceStations(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.bottomSheet}>
                  <View style={styles.bottomSheetHeader}>
                    <Text style={styles.bottomSheetTitle}>Nearby Police Stations</Text>
                    <TouchableOpacity onPress={() => setShowPoliceStations(false)}>
                      <Ionicons name="close" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.policeStationsList}>
                    {policeStations.map((station) => (
                      <View key={station.id} style={styles.policeStationItem}>
                        <View style={styles.stationInfo}>
                          <Text style={styles.stationName}>{station.name}</Text>
                          <Text style={styles.stationDistance}>{station.distance}</Text>
                          <Text style={styles.stationAddress}>{station.address}</Text>
                        </View>
                        <TouchableOpacity style={styles.directionButton}>
                          <Ionicons name="navigate" size={20} color="#fff" />
                          <Text style={styles.directionButtonText}>Get Direction</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  policeStationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  policeStationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
  },
  policeStationsList: {
    padding: 20,
  },
  policeStationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stationDistance: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 12,
    color: "#666",
  },
  directionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
})
