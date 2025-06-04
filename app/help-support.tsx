"use client"

import { StyleSheet, SafeAreaView, TouchableOpacity, Linking } from "react-native"
import { router } from "expo-router"
import { View, Text, ScrollView, Card } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"

export default function HelpSupportScreen() {
  const handleContactSupport = () => {
    Linking.openURL("mailto:support@rakshanet.com")
  }

  const handleCallSupport = () => {
    Linking.openURL("tel:+918925205027")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#DC2626" />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <TouchableOpacity style={styles.contactItem} onPress={handleContactSupport}>
            <View style={styles.contactInfo}>
              <Ionicons name="mail" size={24} color="#DC2626" />
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@rakshanet.com</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactItem} onPress={handleCallSupport}>
            <View style={styles.contactInfo}>
              <Ionicons name="call" size={24} color="#DC2626" />
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactSubtitle}>+91 89252 05027</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </Card>

        <Card style={styles.faqCard}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How does the SOS feature work?</Text>
            <Text style={styles.faqAnswer}>
              Press and hold the SOS button to trigger an emergency alert. Your location will be shared with your
              emergency contacts via SMS or call.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I add multiple emergency contacts?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can add multiple emergency contacts. All contacts will be notified when you trigger an SOS alert.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How accurate is the location sharing?</Text>
            <Text style={styles.faqAnswer}>
              The app uses GPS to provide accurate location information. Make sure location services are enabled for the
              best accuracy.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What if I accidentally trigger SOS?</Text>
            <Text style={styles.faqAnswer}>
              You have a 10-second countdown to cancel the SOS alert before it&apos;s sent to your emergency contacts.
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
  contactCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#DC2626",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactDetails: {
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 8,
  },
  faqCard: {
    marginBottom: 24,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#DC2626",
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  resourcesCard: {
    marginBottom: 24,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  resourceText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
})
