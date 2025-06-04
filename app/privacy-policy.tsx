"use client"

import { StyleSheet, SafeAreaView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { View, Text, ScrollView } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#DC2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.content}>
          We collect the following types of information:{"\n"}• Personal information (name, email, phone number, age)
          {"\n"}• Location data (only when SOS is triggered){"\n"}• Emergency contact information{"\n"}• App usage data
          for improving our services
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.content}>
          Your information is used to:{"\n"}• Provide emergency alert services{"\n"}• Share your location with emergency
          contacts during SOS{"\n"}• Improve app functionality and user experience{"\n"}• Send important service
          notifications
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.content}>
          We do not sell, trade, or share your personal information with third parties except:{"\n"}• With your
          emergency contacts when you trigger SOS{"\n"}• When required by law or legal process{"\n"}• To protect the
          safety and security of our users
        </Text>

        <Text style={styles.sectionTitle}>4. Location Data</Text>
        <Text style={styles.content}>
          Location data is only collected and shared when:{"\n"}• You trigger an SOS alert{"\n"}• You explicitly request
          location sharing{"\n"}
          We do not continuously track your location or store location history.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.content}>
          We implement appropriate security measures to protect your personal information against unauthorized access,
          alteration, disclosure, or destruction. This includes encryption of sensitive data and secure data
          transmission.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.content}>
          We retain your personal information only as long as necessary to provide our services or as required by law.
          You can request deletion of your account and associated data at any time.
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.content}>
          You have the right to:{"\n"}• Access your personal information{"\n"}• Correct inaccurate information{"\n"}•
          Delete your account and data{"\n"}• Opt-out of non-essential communications
        </Text>

        <Text style={styles.sectionTitle}>8. Children&apos;s Privacy</Text>
        <Text style={styles.content}>
          Our service is not intended for children under 13. We do not knowingly collect personal information from
          children under 13. If you are a parent and believe your child has provided us with personal information,
          please contact us.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to Privacy Policy</Text>
        <Text style={styles.content}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy in the app and updating the &quot;Last updated&quot; date.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.content}>
          If you have any questions about this Privacy Policy, please contact us at:{"\n"}
          Email: privacy@rakshanet.com{"\n"}
          Phone: +91 89252 05027
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
