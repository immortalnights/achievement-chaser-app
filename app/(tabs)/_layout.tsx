import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
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
        }}
      />
    </Tabs>
  )
}
