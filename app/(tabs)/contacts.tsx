"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  View,
  Text,
  Card,
  ScrollView,
  TextInput,
  Button,
} from "@/components/themed";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/context/auth-context";
import { contactService, type Contact } from "@/services/contactService";

export default function ContactsScreen() {
  const { accessToken } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor(
    { light: "#E0E0E0", dark: "#333333" },
    "icon"
  );

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    if (!accessToken) return;

    try {
      const response = await contactService.getContacts(accessToken);
      if (response.success) {
        setContacts(response.data.contacts);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleSendOTP = async () => {
    if (!newContact.phone) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    if (!accessToken) {
      Alert.alert("Error", "Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await contactService.sendOTP(
        newContact.phone,
        accessToken
      );
      if (response.success) {
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }

    if (!accessToken) {
      Alert.alert("Error", "Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await contactService.verifyOTP(
        newContact.phone,
        otp,
        accessToken
      );
      if (response.success) {
        setIsOtpVerified(true);
        Alert.alert("Success", "Phone number verified successfully");
      } else {
        Alert.alert("Error", response.error || "Invalid OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!isOtpVerified) {
      Alert.alert("Error", "Please verify the phone number first");
      return;
    }

    if (!accessToken) {
      Alert.alert("Error", "Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await contactService.addContact(
        newContact.name,
        newContact.phone,
        newContact.relationship,
        accessToken
      );

      if (response.success) {
        await loadContacts();
        resetForm();
        Alert.alert("Success", "Emergency contact added successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to add contact");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async () => {
    if (!isEditing || !accessToken) return;

    if (!newContact.name || !newContact.relationship) {
      Alert.alert("Error", "Name and relationship are required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await contactService.updateContact(
        isEditing,
        newContact.name,
        newContact.relationship,
        accessToken
      );

      if (response.success) {
        await loadContacts();
        resetForm();
        Alert.alert("Success", "Contact updated successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to update contact");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    });
    setIsEditing(contact.id);
    setIsOtpVerified(true); // Skip OTP for editing
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!accessToken) return;

            try {
              const response = await contactService.deleteContact(
                id,
                accessToken
              );
              if (response.success) {
                await loadContacts();
                Alert.alert("Success", "Contact deleted successfully");
              } else {
                Alert.alert(
                  "Error",
                  response.error || "Failed to delete contact"
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete contact");
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewContact({ name: "", phone: "", relationship: "" });
    setOtp("");
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setIsAdding(false);
    setIsEditing(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Contacts</Text>
          {!isAdding && !isEditing && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <Ionicons name="add" size={24} color="#0a7ea4" />
            </TouchableOpacity>
          )}
        </View>

        {(isAdding || isEditing) && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isEditing ? "Edit Contact" : "Add New Contact"}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact name"
                value={newContact.name}
                onChangeText={(text) =>
                  setNewContact({ ...newContact, name: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Phone number with country code"
                  value={newContact.phone}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, phone: text })
                  }
                  keyboardType="phone-pad"
                  editable={!isEditing}
                />
                {!isEditing && !isOtpVerified && (
                  <Button
                    style={[
                      styles.otpButton,
                      isOtpSent && styles.otpButtonSent,
                    ]}
                    onPress={isOtpSent ? handleVerifyOTP : handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : isOtpSent ? "Verify" : "Send OTP"}
                  </Button>
                )}
                {isOtpVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4CAF50"
                    />
                  </View>
                )}
              </View>
            </View>

            {isOtpSent && !isOtpVerified && !isEditing && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="Family, Friend, etc."
                value={newContact.relationship}
                onChangeText={(text) =>
                  setNewContact({ ...newContact, relationship: text })
                }
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                style={[styles.formButton, styles.cancelButton]}
                onPress={resetForm}
              >
                Cancel
              </Button>
              <Button
                style={[
                  styles.formButton,
                  !isOtpVerified && !isEditing && styles.disabledButton,
                ]}
                onPress={isEditing ? handleUpdateContact : handleAddContact}
                disabled={(!isOtpVerified && !isEditing) || isLoading}
              >
                {isLoading ? "..." : isEditing ? "Update" : "Add"}
              </Button>
            </View>
          </Card>
        )}

        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Card key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={24} color="#0a7ea4" />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelationship}>
                    {contact.relationship}
                  </Text>
                </View>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor }]}
                  onPress={() => handleEditContact(contact)}
                >
                  <Ionicons name="create-outline" size={20} color="#0a7ea4" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor }]}
                  onPress={() => handleDeleteContact(contact.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={48}
              color={textColor}
              style={{ opacity: 0.5 }}
            />
            <Text style={styles.emptyStateText}>
              No emergency contacts added yet
            </Text>
            {!isAdding && (
              <Button
                style={styles.emptyStateButton}
                onPress={() => setIsAdding(true)}
              >
                Add Your First Contact
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
  addButton: {
    padding: 8,
  },
  formCard: {
    marginBottom: 24,
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    width: "100%",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  otpButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
  },
  otpButtonSent: {
    backgroundColor: "#4CAF50",
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#888888",
  },
  disabledButton: {
    opacity: 0.5,
  },
  contactCard: {
    marginBottom: 12,
    padding: 16,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
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
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    opacity: 0.7,
  },
  contactActions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  emptyStateButton: {
    minWidth: 200,
  },
});
