import React from "react";
import { View, StyleSheet } from "react-native";
import AchievementDisplay, { Achievement } from "../components/AchievementDisplay";

// 12 test achievements for layout
const mockAchievements: Achievement[] = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  name: i === 0 ? "First Win" : `Achievement ${i + 1}`,
  description: i === 0 ? "Win your first game today!" : "Test achievement description.",
  iconUrl: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/440/6b6e616f8e7e2e6e6e6e6e6e6e6e6e6e6e6e6e6e.jpg",
}));

const HomeScreen = () => (
  <View style={styles.container}>
    <AchievementDisplay achievements={mockAchievements} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
