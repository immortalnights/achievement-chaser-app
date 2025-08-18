import React from "react";
import { View, Text } from "react-native";

const RecentActivityScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24, fontWeight: "bold" }}>Recent Activity</Text>
    <Text>See your recent Steam achievements here.</Text>
  </View>
);

export default RecentActivityScreen;
