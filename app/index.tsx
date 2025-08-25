import { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import SteamLoginScreen from "../screens/SteamLoginScreen"
import MainTabs from "../navigation/MainTabs"

export default function Index() {
  const [steamId, setSteamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem("steamId").then((id) => {
      setSteamId(id)
      setLoading(false)
    })
  }, [])

  const handleSteamIdSubmit = async (id: string) => {
    await AsyncStorage.setItem("steamId", id)
    setSteamId(id)
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!steamId) {
    return <SteamLoginScreen onSubmit={handleSteamIdSubmit} />
  }

  // Show tab navigation once logged in, pass logout callback
  const handleLogout = async () => {
    await AsyncStorage.clear()
    setSteamId(null)
  }
  return <MainTabs onLogout={handleLogout} />
}
