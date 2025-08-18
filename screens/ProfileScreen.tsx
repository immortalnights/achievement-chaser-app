import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, ActivityIndicator } from "react-native";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { request } from "graphql-request";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";
import { playerProfile } from "../graphql/documents";

const API_URL = config.API_URL;

const ProfileScreen = ({ onLogout }: { onLogout: () => void }) => {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("steamId").then((id) => {
      setSteamId(id);
    });
  }, []);

  useEffect(() => {
    if (!steamId) return;
    setLoading(true);
    request(API_URL, playerProfile, { player: steamId })
      .then((data: any) => {
        setProfile(data.player);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [steamId]);

  if (loading || !profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Calculate derived stats
  const ownedGames = profile.profile.ownedGames || 0;
  const perfectGames = profile.profile.perfectGames || 0;
  const playedGames = profile.profile.playedGames || 0;
  const totalPlaytime = profile.profile.totalPlaytime || 0;
  const unlockedAchievements = profile.profile.unlockedAchievements || 0;
  const lockedAchievements = profile.profile.lockedAchievements || 0;
  const displayName = profile.name;
  const profileUrl = profile.profileUrl;
  const avatarUrl = profile.avatarLargeUrl;
  const gamesCompletedPct = ownedGames ? Math.round((playedGames / ownedGames) * 100) : 0;
  const playTimeYears = (totalPlaytime / (60 * 24 * 365)).toFixed(2); // playtime in years
  const perfectGamesPct = ownedGames ? ((perfectGames / ownedGames) * 100).toFixed(2) : "0.00";
  const achievementsUnlocked = unlockedAchievements;
  const achievementsTotal = unlockedAchievements + lockedAchievements;
  const achievementsPct = achievementsTotal ? ((unlockedAchievements / achievementsTotal) * 100).toFixed(2) : "0.00";

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <TouchableOpacity onPress={() => Linking.openURL(profileUrl)}>
        <Text style={styles.displayName}>{displayName}</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Total Games: <Text style={{ color: "#1976d2" }}>{ownedGames}</Text>
      </Text>
      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <MaterialIcons name="check-circle" size={22} color="#1976d2" style={styles.metaIcon} />
          <Text style={styles.metaText}>Games Played: <Text style={styles.metaValue}>{playedGames} ({gamesCompletedPct}%)</Text></Text>
        </View>
        <View style={styles.metaRow}>
          <FontAwesome5 name="clock" size={20} color="#1976d2" style={styles.metaIcon} />
          <Text style={styles.metaText}>Total Play Time: <Text style={styles.metaValue}>{playTimeYears} years</Text></Text>
        </View>
        <View style={styles.metaRow}>
          <FontAwesome5 name="star" size={20} color="#1976d2" style={styles.metaIcon} />
          <Text style={styles.metaText}>Perfect Games: <Text style={styles.metaValue}>{perfectGames} ({perfectGamesPct}%)</Text></Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialIcons name="emoji-events" size={22} color="#1976d2" style={styles.metaIcon} />
          <Text style={styles.metaText}>Achievements Unlocked: <Text style={styles.metaValue}>{achievementsUnlocked} ({achievementsPct}%)</Text></Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 16,
    textDecorationLine: "underline",
  },
  metaContainer: {
    width: "90%",
    marginBottom: 32,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaIcon: {
    marginRight: 10,
  },
  metaText: {
    fontSize: 16,
    color: "#333",
  },
  metaValue: {
    fontWeight: "bold",
    color: "#1976d2",
  },
  logoutBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  logoutText: {
    color: "#333",
    fontSize: 16,
  },
});

export default ProfileScreen;
