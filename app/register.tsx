"use client"

import { useState } from "react"
import { StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from "react-native"
import { router } from "expo-router"
import { View, Text, TextInput, Button, ScrollView } from "@/components/themed"
import { useAuth } from "@/context/auth-context"
import { Ionicons } from "@expo/vector-icons"

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const success = await register(name, email, password, age ? Number.parseInt(age) : undefined)
      if (success) {
        router.push("/emergency-contacts")
      } else {
        Alert.alert("Registration Failed", "Could not create your account")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={() => router.back()}>
            <View style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0a7ea4" />
              <Text style={styles.backText}>Back</Text>
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} placeholder="Enter your full name" value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register"}
            </Button>

            <View style={styles.loginContainer}>
              <Text>Already have an account? </Text>
              <TouchableWithoutFeedback onPress={() => router.push("/")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#0a7ea4",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
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
  registerButton: {
    marginTop: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginLink: {
    fontWeight: "bold",
    color: "#0a7ea4",
  },
})
