"use client"

import { useState, useRef } from "react"
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { router } from "expo-router"
import { View, Text, Button, ScrollView, Card } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"

type Contact = {
  name: string
  phone: string
  relationship: string
}

export default function EmergencyContactsScreen() {
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [relationship, setRelationship] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [otp, setOtp] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [focusedIndex, setFocusedIndex] = useState(-1)
  const otpRefs = useRef<(TextInput | null)[]>([])

  const handleOtpChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newOtp = otp.split("")
      newOtp[index] = text
      setOtp(newOtp.join(""))

      // Auto-focus next input when entering a digit
      if (text && index < 3) {
        otpRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter the contact's name")
      return
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number")
      return
    }
    if (!relationship.trim()) {
      Alert.alert("Error", "Please enter the relationship")
      return
    }

    // In a real app, you would send an OTP to this number
    setIsVerifying(true)
  }

  const handleConfirmOtp = () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Error", "Please enter a valid OTP")
      return
    }

    // In a real app, you would verify the OTP with your backend
    const newContact: Contact = {
      name: name.trim(),
      phone: phoneNumber,
      relationship: relationship.trim(),
    }

    setContacts([...contacts, newContact])
    setName("")
    setPhoneNumber("")
    setRelationship("")
    setOtp("")
    setIsVerifying(false)

    Alert.alert("Success", "Contact added successfully")
  }

  const handleContinue = () => {
    if (contacts.length === 0) {
      Alert.alert("No Contacts Added", "Please add at least one emergency contact to continue")
      return
    }

    // In a real app, you would save these contacts to your backend
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.replace("/(tabs)")
    }, 1000)
  }

  const removeContact = (index: number) => {
    const newContacts = [...contacts]
    newContacts.splice(index, 1)
    setContacts(newContacts)
  }

  const resetForm = () => {
    setName("")
    setPhoneNumber("")
    setRelationship("")
    setOtp("")
    setIsVerifying(false)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Emergency Contacts</Text>
            <Text style={styles.subtitle}>Add contacts who will be notified in case of emergency</Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact's full name"
                value={name}
                onChangeText={setName}
                editable={!isVerifying}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Father, Mother, Friend, Spouse"
                value={relationship}
                onChangeText={setRelationship}
                editable={!isVerifying}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!isVerifying}
                />
                {!isVerifying && (
                  <Button style={styles.verifyButton} onPress={handleVerify}>
                    Verify
                  </Button>
                )}
              </View>
            </View>

            {isVerifying && (
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>Enter verification code</Text>
                <Text style={styles.otpSubLabel}>We sent a 4-digit code to {phoneNumber}</Text>

                <View style={styles.otpBoxContainer}>
                  {[0, 1, 2, 3].map((index) => (
                    <View key={index} style={styles.otpBoxWrapper}>
                      <TextInput
                        ref={(ref) => {
                          if (ref) otpRefs.current[index] = ref
                        }}
                        style={[
                          styles.otpBox,
                          otp[index] && styles.otpBoxFilled,
                          focusedIndex === index && styles.otpBoxFocused,
                        ]}
                        value={otp[index] || ""}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(-1)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        selectTextOnFocus
                        autoFocus={index === 0}
                      />
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.resendContainer} onPress={() => {}}>
                  <Text style={styles.resendText}>Didn't receive code? </Text>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>

                <View style={styles.otpButtonContainer}>
                  <TouchableOpacity style={styles.cancelOtpButton} onPress={resetForm}>
                    <Text style={styles.cancelOtpText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.verifyOtpButton, otp.length === 4 && styles.verifyOtpButtonActive]}
                    onPress={handleConfirmOtp}
                    disabled={otp.length !== 4}
                  >
                    <Text style={styles.verifyOtpText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>

          {contacts.length > 0 && (
            <View style={styles.contactsContainer}>
              <Text style={styles.contactsTitle}>Added Contacts ({contacts.length})</Text>
              {contacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactAvatar}>
                      <Ionicons name="person" size={20} color="#0a7ea4" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    </View>
                  </View>
                  <TouchableWithoutFeedback onPress={() => removeContact(index)}>
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableWithoutFeedback>
                </View>
              ))}
            </View>
          )}

          <Button
            style={[styles.continueButton, contacts.length === 0 && styles.disabledButton]}
            onPress={handleContinue}
            disabled={isLoading || contacts.length === 0}
          >
            {isLoading ? "Setting up..." : "Continue to Dashboard"}
          </Button>

          <Text style={styles.skipText}>
            {contacts.length === 0
              ? "At least one emergency contact is required to continue"
              : "You can add more contacts later from the settings"}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  formCard: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    width: "100%",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    marginRight: 12,
  },
  verifyButton: {
    width: 100,
  },
  otpContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(220, 38, 38, 0.2)",
    alignItems: "center",
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 8,
    textAlign: "center",
  },
  otpSubLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  otpBoxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  otpBoxWrapper: {
    position: "relative",
  },
  otpBox: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
    textAlign: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  otpBoxFocused: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  otpBoxFilled: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  otpButtonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelOtpButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelOtpText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  verifyOtpButton: {
    flex: 1,
    backgroundColor: "#D1D5DB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  verifyOtpButtonActive: {
    backgroundColor: "#DC2626",
    elevation: 2,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verifyOtpText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contactsContainer: {
    marginBottom: 24,
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10, 126, 164, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
  },
  continueButton: {
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  skipText: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 20,
    fontSize: 14,
  },
})
