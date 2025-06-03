"use client"

import { useState } from "react"
import { StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native"
import { View, Text, Card, ScrollView, TextInput, Button } from "@/components/themed"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColor } from "@/hooks/useThemeColor"

// Mock data for emergency contacts
const initialContacts = [
  { id: "1", name: "John Doe", phone: "+918925205027", relationship: "Family" },
  { id: "2", name: "Jane Smith", phone: "+919876543210", relationship: "Friend" },
]

export default function ContactsScreen() {
  const [contacts, setContacts] = useState(initialContacts)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" })

  const textColor = useThemeColor({}, "text")
  const borderColor = useThemeColor({ light: "#E0E0E0", dark: "#333333" }, "icon")

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert("Error", "Name and phone number are required")
      return
    }

    setContacts([...contacts, { id: Date.now().toString(), ...newContact }])
    setNewContact({ name: "", phone: "", relationship: "" })
    setIsAdding(false)
  }

  const handleUpdateContact = () => {
    if (!isEditing) return

    if (!newContact.name || !newContact.phone) {
      Alert.alert("Error", "Name and phone number are required")
      return
    }

    setContacts(contacts.map((contact) => (contact.id === isEditing ? { ...contact, ...newContact } : contact)))
    setNewContact({ name: "", phone: "", relationship: "" })
    setIsEditing(null)
  }

  const handleEditContact = (id: string) => {
    const contactToEdit = contacts.find((contact) => contact.id === id)
    if (contactToEdit) {
      setNewContact({
        name: contactToEdit.name,
        phone: contactToEdit.phone,
        relationship: contactToEdit.relationship || "",
      })
      setIsEditing(id)
    }
  }

  const handleDeleteContact = (id: string) => {
    Alert.alert("Delete Contact", "Are you sure you want to delete this emergency contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setContacts(contacts.filter((contact) => contact.id !== id)),
      },
    ])
  }

  const handleCancel = () => {
    setNewContact({ name: "", phone: "", relationship: "" })
    setIsAdding(false)
    setIsEditing(null)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Contacts</Text>
          {!isAdding && !isEditing && (
            <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
              <Ionicons name="add" size={24} color="#0a7ea4" />
            </TouchableOpacity>
          )}
        </View>

        {(isAdding || isEditing) && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{isEditing ? "Edit Contact" : "Add New Contact"}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact name"
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number with country code"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="Family, Friend, etc."
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button style={[styles.formButton, styles.cancelButton]} onPress={handleCancel}>
                Cancel
              </Button>
              <Button style={styles.formButton} onPress={isEditing ? handleUpdateContact : handleAddContact}>
                {isEditing ? "Update" : "Add"}
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
                  {contact.relationship && <Text style={styles.contactRelationship}>{contact.relationship}</Text>}
                </View>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor }]}
                  onPress={() => handleEditContact(contact.id)}
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
            <Ionicons name="people-outline" size={48} color={textColor} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyStateText}>No emergency contacts added yet</Text>
            {!isAdding && (
              <Button style={styles.emptyStateButton} onPress={() => setIsAdding(true)}>
                Add Your First Contact
              </Button>
            )}
          </View>
        )}
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
})
