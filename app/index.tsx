import AsyncStorage from "@react-native-async-storage/async-storage"
import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

export default function Index() {
  const [steamId, setSteamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem("steamId").then((id) => {
      setSteamId(id)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!steamId) {
    return <Redirect href="/login" />
  }
  return <Redirect href="/(tabs)/home" />
}
