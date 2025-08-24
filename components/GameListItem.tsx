import React, { useEffect, useMemo, useState } from "react"
import { View, Text, Image, StyleSheet, Linking, Pressable } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import dayjs from "dayjs"
import { request } from "graphql-request"
import config from "../config"
import { playerUnlockedAchievements } from "../graphql/documents"

const API_URL = config.API_URL

export const GameListItem = ({ item, styles, steamId }: { item: any; styles: any; steamId?: string | null }) => {
  const [error, setError] = useState(false)
  const [recent, setRecent] = useState<{ id: string; iconUrl: string }[]>([])

  const percent = useMemo(() => {
    if (!item || !item.achievementCount) return 0
    const p = (Number(item.unlocked || 0) / Number(item.achievementCount)) * 100
    return Math.max(0, Math.min(100, Number.isFinite(p) ? p : 0))
  }, [item])

  const playtimeText = useMemo(() => {
    const minutes = Number(item?.playtimeForever || 0)
    if (!Number.isFinite(minutes) || minutes <= 0) return ""
    if (minutes < 60) return `${minutes} minutes`
    const hours = minutes / 60
    const hoursStr = hours.toFixed(1)
    const isSingular = Math.abs(parseFloat(hoursStr) - 1) < 1e-9
    return `${hoursStr} ${isSingular ? "hour" : "hours"}`
  }, [item?.playtimeForever])

  useEffect(() => {
    let ignore = false
    if (!steamId || !item?.id) return
    request(API_URL, playerUnlockedAchievements, {
      player: steamId,
      game: Number(item.id),
      orderBy: "-datetime",
      limit: 5,
    })
      .then((data: any) => {
        if (ignore) return
        const edges = data?.player?.unlockedAchievements?.edges || []
        const mapped = edges.map((e: any) => ({ id: e.node.id, iconUrl: e.node.achievement.iconUrl }))
        setRecent(mapped)
      })
      .catch(() => {
        if (!ignore) setRecent([])
      })
    return () => {
      ignore = true
    }
  }, [steamId, item?.id])

  return (
    <View style={styles.gameRow}>
      <View style={localStyles.cardBody}>
        {/* Top row: icon + main info */}
        <View style={localStyles.topRow}>
        {item.iconUrl && !error ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              if (item?.id) {
                const url = `https://store.steampowered.com/app/${item.id}/`
                Linking.openURL(url).catch(() => {})
              }
            }}
          >
            <Image source={{ uri: item.iconUrl }} style={styles.gameIcon} onError={() => setError(true)} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              if (item?.id) {
                const url = `https://store.steampowered.com/app/${item.id}/`
                Linking.openURL(url).catch(() => {})
              }
            }}
          >
            <View style={[styles.gameIcon, { justifyContent: "center", alignItems: "center" }]}> 
              <MaterialIcons name="help-outline" size={40} color="#888" />
            </View>
          </Pressable>
        )}
        <View style={styles.gameInfo}>
          <Text
            style={styles.gameName}
            accessibilityRole="link"
            onPress={() => {
              if (item?.id) {
                const url = `https://store.steampowered.com/app/${item.id}/`
                Linking.openURL(url).catch(() => {})
              }
            }}
          >
            {item.name}
          </Text>
          {/* Keep difficulty and last played in the top row */}
          {item.difficultyPercentage != null && (
            <Text style={styles.gameMeta}>
              Difficulty: <Text style={styles.metaValue}>{Number(item.difficultyPercentage).toFixed(2)}%</Text>
            </Text>
          )}
          {!!playtimeText && (
            <Text style={styles.gameMeta}>
              Playtime: <Text style={styles.metaValue}>{playtimeText}</Text>
            </Text>
          )}
          <Text style={styles.gameMeta}>
            Last Played:{" "}
            <Text style={styles.metaValue}>
              {dayjs(item.lastPlayed).isValid() ? (
                <>
                  {dayjs(item.lastPlayed).format("LLL")} (
                  <Text style={styles.metaValue}>{dayjs(item.lastPlayed).fromNow()}</Text>)
                </>
              ) : (
                "Never played"
              )}
            </Text>
          </Text>
        </View>
        </View>
        {/* Footer row: achievements summary + progress + recent icons */}
        {item.achievementCount > 0 && (
          <View style={localStyles.footerRow}>
            <View style={localStyles.progressBlock}>
              <Text style={styles.gameMeta}>
                Achievements: <Text style={styles.metaValue}>{item.unlocked} of {item.achievementCount} ({percent.toFixed(2)}%)</Text>
              </Text>
              <View style={localStyles.progressBar}>
                <View style={[localStyles.progressFill, { width: `${percent}%` }]} />
              </View>
            </View>
            <View style={localStyles.recentAchRow}>
              {recent.map((a) => (
                <Image key={a.id} source={{ uri: a.iconUrl }} style={localStyles.achIcon} />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const localStyles = StyleSheet.create({
  cardBody: {
    width: "100%",
    flexDirection: "column",
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  footerRow: {
    width: "100%",
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressBlock: {
    flex: 1,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1976d2",
  },
  recentAchRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  minWidth: 32 * 5 + 8 * 4, // width for 5 icons with 8px gaps
  },
  achIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#444",
    marginLeft: 8,
  },
})
