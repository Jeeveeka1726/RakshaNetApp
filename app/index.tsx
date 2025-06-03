"use client"

import { useState } from "react"
import {
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native"
import { router } from "expo-router"
import { View, Text, TextInput, Button, ScrollView } from "@/components/themed"
import { useAuth } from "@/context/auth-context"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        router.replace("/(tabs)")
      } else {
        Alert.alert("Login Failed", "Invalid email or password")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>RakshaNet</Text>
            <Text style={styles.tagline}>Your Personal Safety Network</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>

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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <View style={styles.registerContainer}>
              <Text>Don't have an account? </Text>
              <TouchableWithoutFeedback onPress={() => router.push("/register")}>
                <Text style={styles.registerLink}>Register</Text>
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
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
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
  loginButton: {
    marginTop: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerLink: {
    fontWeight: "bold",
    color: "#0a7ea4",
  },
})
