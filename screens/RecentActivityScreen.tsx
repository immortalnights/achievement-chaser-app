
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { GameListItem } from '../components/GameListItem';
import { request } from "graphql-request";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { playerGames } from "../graphql/documents";
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);



const API_URL = config.API_URL;

const RecentActivityScreen = () => {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("steamId").then((id) => {
      setSteamId(id);
    });
  }, []);

  useEffect(() => {
    if (!steamId) return;
    setLoading(true);
    request(API_URL, playerGames, {
      player: steamId,
      orderBy: "-lastPlayed",
      limit: 12,
    })
      .then((data: any) => {
        const edges = data?.player?.games?.edges || [];
        const recentGames: any[] = edges.map((edge: any) => {
          const g = edge.node.game;
          return {
            id: g.id,
            name: g.name,
            iconUrl: `https://media.steampowered.com/steam/apps/${g.id}/capsule_184x69.jpg`,
            achievementCount: g.achievementCount,
            difficultyPercentage: g.difficultyPercentage,
            lastPlayed: edge.node.lastPlayed,
            unlocked: edge.node.unlockedAchievementCount,
            playtimeForever: edge.node.playtimeForever,
            completed: edge.node.completed,
          };
        });
        setGames(recentGames);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [steamId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      <FlatList
        data={games}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GameListItem item={item} styles={styles} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  gameIcon: {
    width: 184,
    height: 69,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#333",
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gameMeta: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  metaValue: {
    color: "#1976d2",
    fontWeight: "bold",
  },
});

export default RecentActivityScreen;
