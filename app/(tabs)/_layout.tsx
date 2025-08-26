import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Tabs, usePathname, useRouter } from "expo-router"
import { request } from "graphql-request"
import React, { useEffect, useState } from "react"
import { Image, Platform, Pressable } from "react-native"
import AccountSwitcher from "../../components/AccountSwitcher"
import config from "../../config"
import { useAccount } from "../../context/AccountContext"
import { playerProfile } from "../../graphql/documents"

export default function TabsLayout() {
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { activeSteamId, loading } = useAccount()
  const { accounts } = useAccount()
  const activeName = accounts.find((a) => a.id === activeSteamId)?.name
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const API_URL = config.API_URL
  // Close switcher on tab route change
  useEffect(() => {
    setSwitcherOpen(false)
  }, [pathname])

  // If there is no active account (after removals), send user to login
  useEffect(() => {
    if (!loading && !activeSteamId) {
      router.replace("/login")
    }
  }, [loading, activeSteamId, router])

  // Fetch avatar for active account to display in the Profile tab icon
  useEffect(() => {
    if (!activeSteamId) {
      setAvatarUrl(null)
      return
    }
    let cancelled = false
    request(API_URL, playerProfile, { player: activeSteamId })
      .then((data: any) => {
        if (cancelled) return
        const url = data?.player?.avatarLargeUrl || null
        setAvatarUrl(url)
      })
      .catch(() => {
        if (!cancelled) setAvatarUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [API_URL, activeSteamId])

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarShowLabel: Platform.OS === "web",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="recent"
          options={{
            title: "Recent Activity",
            tabBarIcon: ({ color, size }) => <MaterialIcons name="access-time" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="whats-next"
          options={{
            title: "What's Next",
            tabBarIcon: ({ color, size }) => <MaterialIcons name="lightbulb" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: Platform.OS === "web" ? activeName || "Profile" : "Profile",
            tabBarLabel: Platform.OS === "web" ? activeName || "Profile" : () => null,
            tabBarIcon: ({ color, size }) =>
              avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: size, height: size, borderRadius: 6 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={size} color={color} />
              ),
            // Long press profile tab to open account switcher
            tabBarButton: (props) => (
              <Pressable
                onLongPress={() => setSwitcherOpen(true)}
                onPress={props.onPress}
                onPressIn={props.onPressIn}
                onPressOut={props.onPressOut}
                onLayout={props.onLayout}
                testID={props.testID}
                accessible={props.accessible}
                accessibilityRole={props.accessibilityRole}
                accessibilityState={props.accessibilityState}
                accessibilityLabel={props.accessibilityLabel}
                accessibilityHint={props.accessibilityHint}
                style={props.style}
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
      </Tabs>
      <AccountSwitcher visible={switcherOpen} onClose={() => setSwitcherOpen(false)} onChanged={() => {}} />
    </>
  )
}
