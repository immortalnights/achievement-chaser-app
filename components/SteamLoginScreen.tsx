import React, { useState } from "react"
import { View, Text, TextInput, Button, StyleSheet } from "react-native"

interface Props {
  onSubmit: (steamId: string) => void
}

const SteamLoginScreen: React.FC<Props> = ({ onSubmit }) => {
  const [steamId, setSteamId] = useState("")

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
      />
      <Button
        title="Continue"
        onPress={() => {
          if (steamId.trim()) {
            onSubmit(steamId.trim())
          }
        }}
      />
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

export default SteamLoginScreen
