import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Tabs, usePathname } from "expo-router"
import React, { useState } from "react"
import { Pressable } from "react-native"
import AccountSwitcher from "../../components/AccountSwitcher"

export default function TabsLayout() {
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const pathname = usePathname()
  // Close switcher on tab route change
  React.useEffect(() => {
    setSwitcherOpen(false)
  }, [pathname])

  return (
    <>
      <Tabs screenOptions={{ headerShown: true }}>
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
            title: "Profile",
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
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
