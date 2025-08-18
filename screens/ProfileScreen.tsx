import React from "react";
import { View, Text } from "react-native";

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24, fontWeight: "bold" }}>Profile</Text>
    <Text>Your Steam profile and settings.</Text>
  </View>
);

export default ProfileScreen;
