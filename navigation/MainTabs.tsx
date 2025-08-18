import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import HomeScreen from "../screens/HomeScreen";
import RecentActivityScreen from "../screens/RecentActivityScreen";
import WhatsNextScreen from "../screens/WhatsNextScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Recent"
      component={RecentActivityScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="access-time" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="WhatsNext"
      component={WhatsNextScreen}
      options={{
        tabBarLabel: "What's Next",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="lightbulb" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default MainTabs;
