import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import AchievementDisplay, { Achievement } from "../components/AchievementDisplay";
import { playerUnlockedAchievements } from "../graphql/documents";
import { request } from "graphql-request";
import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "../config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
const API_URL = config.API_URL;

const HomeScreen = () => {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(dayjs());

  // Get steamId from storage
  useEffect(() => {
    AsyncStorage.getItem("steamId").then((id) => {
      setSteamId(id);
    });
  }, []);

  // Fetch achievements for the selected date
  useEffect(() => {
    if (!steamId) return;
    setLoading(true);
  // Set start and end of day in UTC
  // Get local timezone offset in +HH:mm or -HH:mm format
  const tzOffset = date.format('Z');
  const startOfDay = date.hour(0).minute(0).second(0).millisecond(0).format(`YYYY-MM-DDTHH:mm:ss${tzOffset}`);
  const endOfDay = date.hour(23).minute(59).second(59).millisecond(0).format(`YYYY-MM-DDTHH:mm:ss${tzOffset}`);
    request(API_URL, playerUnlockedAchievements, {
      player: steamId,
      range: [startOfDay, endOfDay],
      orderBy: "-datetime",
    }).then((data: any) => {
      const edges = data?.player?.unlockedAchievements?.edges || [];
      const mapped: Achievement[] = edges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.achievement.displayName,
        description: edge.node.achievement.description || "",
        iconUrl: edge.node.achievement.iconUrl,
      }));
      setAchievements(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [steamId, date]);

  // Pass date and setDate to AchievementDisplay for navigation
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <AchievementDisplay achievements={achievements} date={date} setDate={setDate} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
