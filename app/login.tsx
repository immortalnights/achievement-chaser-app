import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { View, Text, TextInput, Button, StyleSheet } from "react-native"

export default function Login() {
  const router = useRouter()
  const [steamId, setSteamId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const id = steamId.trim()
    if (!id || submitting) return
    setSubmitting(true)
    try {
      await AsyncStorage.setItem("steamId", id)
      router.replace("/(tabs)/home")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your Steam Username or ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Steam Username or ID"
        value={steamId}
        onChangeText={setSteamId}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />
      <Button title={submitting ? "Please wait…" : "Continue"} onPress={handleSubmit} disabled={submitting || !steamId.trim()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
})
