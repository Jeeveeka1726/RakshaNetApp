"use client"

import * as Location from "expo-location"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

// Firebase imports
import { useAuth } from "@/context/auth-context"
import { contactService, type Contact } from "@/services/contactService"
import { initializeApp } from "firebase/app"
import { addDoc, collection, getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCdfdZrq2XI7OpoLvB0sTqKgY2ifHrgF8",
  authDomain: "rakshanet--live--location.firebaseapp.com",
  projectId: "rakshanet--live--location",
  storageBucket: "rakshanet--live--location.firebasestorage.app",
  messagingSenderId: "910921426775",
  appId: "1:910921426775:web:9a1777219def3794d08012",
  measurementId: "G-DEMXC216Z9",
}

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function SOSButton() {
  const { accessToken } = useAuth()
  const [locationLink, setLocationLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [selectedMethod, setSelectedMethod] = useState<"SMS" | "Call" | null>(null)
  const [contacts, setContacts] = useState<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const watcherRef = useRef<Location.LocationSubscription | null>(null)

  useEffect(() => {
    loadEmergencyContacts()
  }, [accessToken])

  const loadEmergencyContacts = async () => {
    if (!accessToken) return

    try {
      const response = await contactService.getContacts(accessToken)
      if (response.success) {
        const phoneNumbers = response.data.contacts.map((contact: Contact) => contact.phone)
        setContacts(phoneNumbers)
      }
    } catch (error) {
      console.error("Error loading emergency contacts:", error)
      // Fallback to default contact
      setContacts(["+918925205027"])
    }
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required for SOS.")
        return
      }

      watcherRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (loc) => {
          const link = `https://www.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}`
          setLocationLink(link)
        },
      )
    })()

    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (modalVisible && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    } else if (modalVisible && countdown === 0) {
      setModalVisible(false)
      // If no method selected by countdown end, trigger SMS (default)
      if (!selectedMethod) {
        triggerSelectedAction("SMS")
      } else {
        triggerSelectedAction(selectedMethod)
      }
    }
    return () => clearTimeout(timerRef.current!)
  }, [modalVisible, countdown, selectedMethod])

  const getReadableAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyAeN6n8eMSKveBnlZT_oQQcgsFUfVjVfac`,
      )
      const data = await response.json()
      return data.results[0]?.formatted_address ?? `${lat}, ${lng}`
    } catch (err) {
      console.error("Geocoding error:", err)
      return `${lat}, ${lng}`
    }
  }

  const storeSOSRecord = async (type: "SMS" | "Call", address: string, lat: number, lng: number) => {
    try {
      await addDoc(collection(db, "sosEvents"), {
        type,
        address,
        lat,
        lng,
        timestamp: new Date().toISOString(),
        contacts,
      })
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }
  }

  const sendSMS = async () => {
    if (!locationLink) {
      Alert.alert("Location not available.")
      return
    }

    if (contacts.length === 0) {
      Alert.alert("No emergency contacts found. Please add contacts first.")
      return
    }

    setLoading(true)
    const message = `🚨 SOS! I need help!\n📍Live Location: ${locationLink}`
    const match = locationLink.match(/q=([-\d.]+),([-\d.]+)/)
    const lat = match ? Number.parseFloat(match[1]) : null
    const lng = match ? Number.parseFloat(match[2]) : null

    try {
      for (const to of contacts) {
        const response = await fetch("http://localhost:5500/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ to, message }),
        })

        const data = await response.json()
        if (!data.success) throw new Error(`Failed to send SMS to ${to}`)
      }

      if (lat && lng) {
        const address = await getReadableAddressFromCoords(lat, lng)
        await storeSOSRecord("SMS", address, lat, lng)
      }

      Alert.alert("Success", "SOS SMS sent via server to all contacts.")
    } catch (error: any) {
      console.error("Error sending SMS:", error)
      Alert.alert("Error", error.message || "Could not send SOS SMS.")
    }

    setLoading(false)
  }

  const callNow = async () => {
    if (!locationLink) {
      Alert.alert("Location not available.")
      return
    }

    if (contacts.length === 0) {
      Alert.alert("No emergency contacts found. Please add contacts first.")
      return
    }

    setLoading(true)
    const match = locationLink.match(/q=([-\d.]+),([-\d.]+)/)
    const lat = match ? Number.parseFloat(match[1]) : null
    const lng = match ? Number.parseFloat(match[2]) : null

    let humanAddress = "unknown location"
    if (lat && lng) {
      humanAddress = await getReadableAddressFromCoords(lat, lng)
    }

    try {
      const response = await fetch("http://localhost:5500/make-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: contacts[0], // Call the first contact
          message: `🚨 SOS! I need help!\n📍Location: ${humanAddress}`,
        }),
      })

      const contentType = response.headers.get("content-type")
      let data: any = {}

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error("Unexpected response from server: " + text)
      }

      if (response.ok && data.success) {
        if (lat && lng) {
          await storeSOSRecord("Call", humanAddress, lat, lng)
        }
        Alert.alert("Success", "Twilio call initiated.")
      } else {
        Alert.alert("Error", data?.error || "Failed to initiate call")
      }
    } catch (err) {
      console.error("Error initiating call:", err)
      Alert.alert("Error", "Could not initiate SOS call.")
    }

    setLoading(false)
  }

  const triggerSelectedAction = async (method: "SMS" | "Call") => {
    setLoading(true)
    try {
      if (method === "SMS") {
        await sendSMS()
      } else {
        await callNow()
      }
    } catch (err) {
      console.error("Error in triggerSelectedAction:", err)
    }
    setLoading(false)
  }

  const handleSOSPress = () => {
    if (contacts.length === 0) {
      Alert.alert("No Emergency Contacts", "Please add emergency contacts before using SOS.", [{ text: "OK" }])
      return
    }

    setCountdown(10)
    setSelectedMethod(null)
    setModalVisible(true)
  }

  const cancelSOS = () => {
    clearTimeout(timerRef.current!)
    setModalVisible(false)
    setCountdown(10)
    setSelectedMethod(null)
  }

  const selectMethod = (method: "SMS" | "Call") => {
    setSelectedMethod(method)
    setModalVisible(false)
    triggerSelectedAction(method)
  }

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="red" />}

      {!loading && !modalVisible && (
        <TouchableOpacity style={styles.sosButton} onPress={handleSOSPress}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={cancelSOS}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.countdownText}>Choose SOS method ({countdown}s remaining)</Text>
                <Text style={styles.subText}>
                  {selectedMethod ? `${selectedMethod} selected` : "SMS will be sent if no selection"}
                </Text>
                <Text style={styles.contactsText}>
                  Will notify {contacts.length} emergency contact{contacts.length !== 1 ? "s" : ""}
                </Text>

                <View style={styles.methodButtons}>
                  <TouchableOpacity style={[styles.methodButton, styles.smsButton]} onPress={() => selectMethod("SMS")}>
                    <Text style={styles.methodButtonText}>📱 Send SMS</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.methodButton, styles.callButton]}
                    onPress={() => selectMethod("Call")}
                  >
                    <Text style={styles.methodButtonText}>📞 Make Call</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={cancelSOS}>
                  <Text style={styles.cancelButtonText}>Cancel SOS</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", flex: 1 },
  sosButton: {
    width: 180,
    height: 180,
    backgroundColor: "#DC2626",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sosText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 40,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    width: 320,
    alignItems: "center",
  },
  countdownText: {
    fontSize: 20,
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
    textAlign: "center",
  },
  contactsText: {
    fontSize: 12,
    color: "#DC2626",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  methodButtons: {
    width: "100%",
    marginBottom: 20,
  },
  methodButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  smsButton: {
    backgroundColor: "#4CAF50",
  },
  callButton: {
    backgroundColor: "#2196F3",
  },
  methodButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f44336",
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
})
