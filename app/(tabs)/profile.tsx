import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { request } from "graphql-request"
import React, { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import ScreenContainer from "../../components/ScreenContainer"
import config from "../../config"
import { useAccount } from "../../context/AccountContext"
import { playerProfile } from "../../graphql/documents"
// use account context instead of utils

const API_URL = config.API_URL

export default function Profile() {
  const router = useRouter()
  const { activeSteamId, loading: accountsLoading } = useAccount()
  const [steamId, setSteamId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setSteamId(activeSteamId)
  }, [activeSteamId])

  // If there are no accounts left, return to login
  useEffect(() => {
    if (!accountsLoading && !activeSteamId) {
      router.replace("../login")
    }
  }, [accountsLoading, activeSteamId, router])

  const fetchProfile = useCallback(
    (opts?: { refresh?: boolean }) => {
      if (!steamId) return
      if (opts?.refresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      request(API_URL, playerProfile, { player: steamId })
        .then((data: any) => {
          setProfile(data.player)
        })
        .catch(() => {
          setError("Failed to load profile. Please try again later.")
        })
        .finally(() => {
          if (opts?.refresh) setRefreshing(false)
          else setLoading(false)
        })
    },
    [steamId]
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading) {
    return (
      <ScreenContainer>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile({ refresh: true })} />}
        >
          <View style={styles.containerInner}>
            <ActivityIndicator size="large" />
          </View>
        </ScrollView>
      </ScreenContainer>
    )
  }

  if (error) {
    return (
      <ScreenContainer>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile({ refresh: true })} />}
        >
          <View style={styles.containerInner}>
            <Text style={{ color: "#d32f2f", fontSize: 18, marginBottom: 16 }}>{error}</Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    )
  }

  if (!profile) {
    return (
      <ScreenContainer>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile({ refresh: true })} />}
        >
          <View style={styles.containerInner}>
            <Text style={{ color: "#d32f2f", fontSize: 18, marginBottom: 16 }}>No profile data found.</Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    )
  }

  const ownedGames = profile.profile.ownedGames || 0
  const perfectGames = profile.profile.perfectGames || 0
  const playedGames = profile.profile.playedGames || 0
  const totalPlaytime = profile.profile.totalPlaytime || 0
  const unlockedAchievements = profile.profile.unlockedAchievements || 0
  const lockedAchievements = profile.profile.lockedAchievements || 0
  const displayName = profile.name
  const profileUrl = profile.profileUrl
  const avatarUrl = profile.avatarLargeUrl
  const gamesCompletedPct = ownedGames ? Math.round((playedGames / ownedGames) * 100) : 0
  const playTimeYears = (totalPlaytime / (60 * 24 * 365)).toFixed(2)
  const perfectGamesPct = ownedGames ? ((perfectGames / ownedGames) * 100).toFixed(2) : "0.00"
  const achievementsTotal = unlockedAchievements + lockedAchievements
  const achievementsPct = achievementsTotal ? ((unlockedAchievements / achievementsTotal) * 100).toFixed(2) : "0.00"

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile({ refresh: true })} />}
      >
        <View style={styles.containerInner}>
          <View style={styles.avatarShadow}>
            <View style={styles.avatarClip}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
            </View>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(profileUrl)}>
            <Text style={styles.displayName}>{displayName}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Total Games: <Text style={{ color: "#1976d2" }}>{ownedGames}</Text>
          </Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <MaterialIcons name="check-circle" size={22} color="#1976d2" style={styles.metaIcon} />
              <Text style={styles.metaText}>
                Games Played:{" "}
                <Text style={styles.metaValue}>
                  {playedGames} ({gamesCompletedPct}%)
                </Text>
              </Text>
            </View>
            <View style={styles.metaRow}>
              <FontAwesome5 name="clock" size={20} color="#1976d2" style={styles.metaIcon} />
              <Text style={styles.metaText}>
                Total Play Time: <Text style={styles.metaValue}>{playTimeYears} years</Text>
              </Text>
            </View>
            <View style={styles.metaRow}>
              <FontAwesome5 name="star" size={20} color="#1976d2" style={styles.metaIcon} />
              <Text style={styles.metaText}>
                Perfect Games:{" "}
                <Text style={styles.metaValue}>
                  {perfectGames} ({perfectGamesPct}%)
                </Text>
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="emoji-events" size={22} color="#1976d2" style={styles.metaIcon} />
              <Text style={styles.metaText}>
                Achievements Unlocked:{" "}
                <Text style={styles.metaValue}>
                  {unlockedAchievements} ({achievementsPct}%)
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  containerInner: {
    alignItems: "center",
    paddingTop: 32,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  avatarShadow: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  avatarClip: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
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
  // removed logout styles as logout is no longer part of the flow
})
