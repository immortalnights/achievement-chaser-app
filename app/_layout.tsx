import { Stack } from "expo-router"
import React from "react"
import { AccountProvider } from "../context/AccountContext"

export default function RootLayout() {
  return (
    <AccountProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AccountProvider>
  )
}
