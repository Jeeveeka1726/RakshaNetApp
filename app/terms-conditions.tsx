"use client"

import { StyleSheet, SafeAreaView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { View, Text, ScrollView } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#DC2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.content}>
          By downloading, installing, or using the RakshaNet mobile application, you agree to be bound by these Terms
          and Conditions. If you do not agree to these terms, please do not use our service.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.content}>
          RakshaNet is a personal safety application that provides emergency alert services, location sharing, and
          communication with emergency contacts. The service is designed to help users in emergency situations.
        </Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.content}>
          • You must provide accurate and current information when setting up emergency contacts{"\n"}• You are
          responsible for maintaining the confidentiality of your account{"\n"}• You must not use the service for false
          emergencies or malicious purposes{"\n"}• You must ensure your device has proper network connectivity for the
          service to function
        </Text>

        <Text style={styles.sectionTitle}>4. Emergency Services</Text>
        <Text style={styles.content}>
          RakshaNet is not a replacement for official emergency services. In case of a real emergency, you should
          contact local emergency services (police, fire, medical) directly. Our service is designed to supplement, not
          replace, official emergency response systems.
        </Text>

        <Text style={styles.sectionTitle}>5. Location Data</Text>
        <Text style={styles.content}>
          The app requires access to your location to provide emergency services. Location data is only shared with your
          designated emergency contacts when you trigger an SOS alert. We do not store or share your location data for
          any other purposes.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.content}>
          RakshaNet and its developers shall not be liable for any damages arising from the use or inability to use the
          service, including but not limited to network failures, device malfunctions, or delayed emergency responses.
        </Text>

        <Text style={styles.sectionTitle}>7. Privacy</Text>
        <Text style={styles.content}>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
          protect your information.
        </Text>

        <Text style={styles.sectionTitle}>8. Modifications</Text>
        <Text style={styles.content}>
          We reserve the right to modify these terms at any time. Users will be notified of significant changes through
          the app or email.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Information</Text>
        <Text style={styles.content}>
          If you have any questions about these Terms and Conditions, please contact us at support@rakshanet.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
  },
  container: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    color: "#DC2626",
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "justify",
  },
})
