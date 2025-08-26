import { request } from "graphql-request"
import React, { useEffect, useMemo, useState } from "react"
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native"
import AchievementDisplay, { Achievement } from "../../components/AchievementDisplay"
import ScreenContainer from "../../components/ScreenContainer"
import SelectDateModal from "../../components/SelectDateModal"
import { playerUnlockedAchievements } from "../../graphql/documents"

import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import utc from "dayjs/plugin/utc"
import config from "../../config"
import { useAccount } from "../../context/AccountContext"
dayjs.extend(utc)
dayjs.extend(advancedFormat)
const API_URL = config.API_URL

export default function Home() {
  const [steamId, setSteamId] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [primaryIdx, setPrimaryIdx] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(dayjs())
  const [showDateJump, setShowDateJump] = useState(false)

  // Get steamId from storage
  const { activeSteamId } = useAccount()

  useEffect(() => {
    setSteamId(activeSteamId)
  }, [activeSteamId])

  // Global keyboard navigation (web)
  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          setDate((prev: any) => prev.subtract(1, "day"))
        } else if (e.key === "ArrowRight") {
          if (!date.isSame(dayjs(), "day")) setDate((prev: any) => prev.add(1, "day"))
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
    return () => {}
  }, [date])

  // Global swipe navigation (native + web mouse)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gestureState) => Math.abs(gestureState.dx) > 20,
        onPanResponderRelease: (_evt, gestureState) => {
          if (gestureState.dx < -50) {
            // swipe left -> next day (if allowed)
            setDate((prev: any) => (!prev.isSame(dayjs(), "day") ? prev.add(1, "day") : prev))
          } else if (gestureState.dx > 50) {
            // swipe right -> previous day
            setDate((prev: any) => prev.subtract(1, "day"))
          }
        },
      }),
    []
  )

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
          gameName: edge.node.game?.name,
          gameId: edge.node.game?.id,
          difficultyPercentage: edge.node.game?.difficultyPercentage,
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

  const isToday = date.isSame(dayjs(), "day")
  const handleJumpOpen = () => {
    setShowDateJump(true)
  }
  const handleJumpCancel = () => setShowDateJump(false)
  const handleJumpSubmit = (d: dayjs.Dayjs) => {
    setDate(d)
    setShowDateJump(false)
  }

  return (
    <ScreenContainer>
      <View style={styles.centerWrap} {...panResponder.panHandlers}>
        {/* Date above the card, constrained to card width */}
        <View style={styles.dateContainer}>
          <Text style={styles.headerDate}>{isToday ? "Today" : date.format("dddd Do MMMM")}</Text>
        </View>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={[styles.skeletonCard, styles.skeletonCardMin]}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonDescLine} />
              <View style={[styles.skeletonDescLine, styles.skeletonDescShort]} />
              <View style={styles.skeletonDescPad} />
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
          </View>
        ) : (
          <AchievementDisplay
            achievements={achievements}
            primaryIdx={primaryIdx}
            onSelectAchievement={handleSelectAchievement}
            steamId={steamId}
            isToday={date.isSame(dayjs(), "day")}
          />
        )}
        {/* Actions below the card, aligned right */}
        <View style={styles.belowCardActionsOuter}>
          <View style={styles.belowCardActionsInner}>
            <View style={styles.dateActionsRow}>
              {!isToday && (
                <Pressable
                  onPress={() => setDate(dayjs())}
                  style={({ pressed }) => [styles.datePill, pressed && styles.pressed]}
                >
                  <Text style={styles.datePillText}>Today</Text>
                </Pressable>
              )}
              <Pressable onPress={handleJumpOpen} style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}>
                <Text style={styles.linkBtnText}>Select date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <SelectDateModal
        visible={showDateJump}
        initialDate={date}
        onCancel={handleJumpCancel}
        onSubmit={handleJumpSubmit}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  dateContainer: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 6,
  },
  dateActionsRow: {
  flexDirection: "row",
  marginTop: 6,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
  },
  headerDate: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  datePill: {
    backgroundColor: "#e5f0ff",
    borderColor: "#99b8ff",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  datePillText: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  linkBtn: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  marginLeft: 12,
  },
  linkBtnText: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.8,
  },
  skeletonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 0,
  },
  belowCardActionsOuter: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  belowCardActionsInner: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    alignItems: "flex-end",
  },
  skeletonCard: {
    width: "100%",
    maxWidth: 600,
    marginHorizontal: 12,
    alignSelf: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  skeletonCardMin: {
    minHeight: 420,
  },
  skeletonTitle: {
    width: "70%",
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonIcon: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 24,
    // Subtle shadow to mimic primary icon shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
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
  skeletonDescPad: {
    height: 12,
  },
  skeletonInfoSpacer: {
    height: 24,
  },
  skeletonAchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
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
    // Light shadow to mimic mini icon shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
})
