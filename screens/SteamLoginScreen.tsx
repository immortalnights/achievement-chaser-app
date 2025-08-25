import React, { useState } from "react"
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native"
import { request } from "graphql-request"
import config from "../config"
import { searchPlayers } from "../graphql/documents"
import ScreenContainer from "../components/ScreenContainer"

interface Props {
  onSubmit: (steamId: string) => void
}

const API_URL = config.API_URL

const SteamLoginScreen: React.FC<Props> = ({ onSubmit }) => {
  const [steamId, setSteamId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <ScreenContainer style={styles.centered}>
      <Text style={styles.title}>Enter your Steam Username or ID</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Steam Username or ID"
          value={steamId}
          onChangeText={setSteamId}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <View style={{ marginTop: 8 }}>
        <Button
          title={submitting ? "Please wait…" : "Continue"}
          disabled={submitting}
          onPress={async () => {
            const input = steamId.trim()
            if (!input) {
              setError("Please enter a username or ID.")
              return
            }
            setError(null)
            // If numeric, treat as SteamID directly
            if (/^\d+$/.test(input)) {
              onSubmit(input)
              return
            }
            // Otherwise try to resolve via searchPlayers
            try {
              setSubmitting(true)
              const data: any = await request(API_URL, searchPlayers, { name: input })
              const found = data?.player
              if (found?.id) {
                onSubmit(String(found.id))
              } else {
                setError("No player found with that name.")
              }
            } catch {
              setError("Unable to search for player. Please try again.")
            } finally {
              setSubmitting(false)
            }
          }}
        />
      </View>
      {submitting && (
        <View style={{ marginTop: 12 }}>
          <ActivityIndicator />
        </View>
      )}
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
    marginTop: 4,
  },
})

export default SteamLoginScreen
