import { useRouter } from "expo-router"
import { ClientError, request } from "graphql-request"
import React, { useState } from "react"
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import ScreenContainer from "../components/ScreenContainer"
import config from "../config"
import { searchPlayers } from "../graphql/documents"
import { useAccount } from "../context/AccountContext"

export default function Login() {
  const router = useRouter()
  const { addAccount } = useAccount()
  const [steamId, setSteamId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = config.API_URL

  const handleSubmit = async () => {
    if (submitting) return
    const input = steamId.trim()
    if (!input) {
      setError("Please enter a username or ID.")
      return
    }
    setError(null)

    // Resolve via searchPlayers for both vanity and numeric to ensure we get a friendly name
    try {
      setSubmitting(true)
      const data: any = await request(API_URL, searchPlayers, { name: input })
      const found = data?.player
      if (found?.id) {
        await addAccount(String(found.id), found.name || String(found.id))
        router.replace("/(tabs)/home")
      } else {
        setError("Unable to find player. Please try again.")
      }
    } catch (e: any) {
      if (e instanceof ClientError || (e && e.response && e.response.errors)) {
        setError("Unable to find player. Please try again.")
      } else {
        setError("Request failed. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScreenContainer style={styles.centered}>
      <Text style={styles.title}>Enter your Steam Username or ID</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Steam Username or ID"
          value={steamId}
          onChangeText={(v) => {
            setSteamId(v)
            if (error) setError(null)
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={handleSubmit}
          editable={!submitting}
        />
      </View>
      <View style={styles.errorSlot}>{error ? <Text style={styles.errorText}>{error}</Text> : null}</View>
      <View style={{ marginTop: 8, width: "100%", maxWidth: 480 }}>
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.btn, submitting && styles.btnDisabled]}
          disabled={submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <View style={styles.btnContent}>
              <ActivityIndicator color="#fff" />
              <Text style={[styles.btnText, { marginLeft: 8 }]}>Please wait.</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: "bold",
  },
  inputWrap: {
    width: "100%",
    maxWidth: 480,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
  },
  errorSlot: {
    width: "100%",
    maxWidth: 480,
    minHeight: 20,
    marginTop: 4,
  },
  btn: {
    width: "50%",
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
})
