import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import React from "react"
import SteamLoginScreen from "../components/SteamLoginScreen"

export default function Login() {
  const router = useRouter()
  const handleSteamIdSubmit = async (id: string) => {
    await AsyncStorage.setItem("steamId", id)
    router.replace("/(tabs)/home")
  }
  return <SteamLoginScreen onSubmit={handleSteamIdSubmit} />
}
