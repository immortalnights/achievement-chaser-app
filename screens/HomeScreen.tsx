import AsyncStorage from "@react-native-async-storage/async-storage"
import { request } from "graphql-request"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import AchievementDisplay, { Achievement } from "../components/AchievementDisplay"
import { playerUnlockedAchievements } from "../graphql/documents"

import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import config from "../config"
dayjs.extend(utc)
const API_URL = config.API_URL

const HomeScreen = () => {
  const [steamId, setSteamId] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [primaryIdx, setPrimaryIdx] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(dayjs())

  // Get steamId from storage
  useEffect(() => {
    AsyncStorage.getItem("steamId").then((id) => {
      setSteamId(id)
    })
  }, [])

  // Fetch achievements for the selected date
  useEffect(() => {
    if (!steamId) return
    setLoading(true)
    // Set start and end of day in UTC
    // Get local timezone offset in +HH:mm or -HH:mm format
    const tzOffset = date.format("Z")
    const startOfDay = date.hour(0).minute(0).second(0).millisecond(0).format(`YYYY-MM-DDTHH:mm:ss${tzOffset}`)
    const endOfDay = date.hour(23).minute(59).second(59).millisecond(0).format(`YYYY-MM-DDTHH:mm:ss${tzOffset}`)
    request(API_URL, playerUnlockedAchievements, {
      player: steamId,
      range: [startOfDay, endOfDay],
      orderBy: "-datetime",
    })
      .then((data: any) => {
        const edges = data?.player?.unlockedAchievements?.edges || []
        const mapped: Achievement[] = edges.map((edge: any) => ({
          id: edge.node.id,
          name: edge.node.achievement.displayName,
          description: edge.node.achievement.description || "",
          iconUrl: edge.node.achievement.iconUrl,
        }))
        setAchievements(mapped)
        // Reset focus to first achievement for the new date/data
        setPrimaryIdx(0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [steamId, date])

  // Handler to change the focused (primary) achievement
  const handleSelectAchievement = (idx: number) => {
    if (idx < 0 || idx >= achievements.length) return
    setPrimaryIdx(idx)
  }

  // Pass date and setDate to AchievementDisplay for navigation
  return (
    <View style={styles.container}>
      {/* Header date (slightly toned down) */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{date.format("dddd, D MMMM")}</Text>
      </View>
      {loading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonDescLine} />
          <View style={[styles.skeletonDescLine, styles.skeletonDescShort]} />
          {/* Reserve space similar to info spacer between text and row */}
          <View style={styles.skeletonInfoSpacer} />
          {/* Placeholder row to reserve space for achievement thumbnails */}
          <View style={styles.skeletonAchRow}>
            <View style={styles.skeletonMiniIcon} />
            <View style={styles.skeletonMiniIcon} />
            <View style={styles.skeletonMiniIcon} />
            <View style={styles.skeletonMiniIcon} />
          </View>
        </View>
      ) : (
        <AchievementDisplay
          achievements={achievements}
          primaryIdx={primaryIdx}
          onSelectAchievement={handleSelectAchievement}
          onPrevDay={() => setDate((prev: any) => prev.subtract(1, "day"))}
          onNextDay={() => setDate((prev: any) => prev.add(1, "day"))}
          canGoNext={!date.isSame(dayjs(), "day")}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerDate: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  skeletonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  skeletonTitle: {
    width: "70%",
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 12,
  },
  skeletonDescLine: {
    width: "85%",
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonDescShort: {
    width: "65%",
  },
  skeletonInfoSpacer: {
    height: 24,
  },
  skeletonAchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  skeletonMiniIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#444",
    marginHorizontal: 8,
    marginBottom: 8,
  },
})

export default HomeScreen
