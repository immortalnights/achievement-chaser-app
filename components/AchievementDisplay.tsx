import React, { useEffect } from "react"
import type { GestureResponderEvent, PanResponderGestureState } from "react-native"
import { Image, Linking, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export type Achievement = {
  id: string
  name: string
  description: string
  iconUrl: string
  gameName?: string
  gameId?: string | number
  difficultyPercentage?: number
}

type Props = {
  achievements: Achievement[]
  primaryIdx?: number
  onSelectAchievement?: (idx: number) => void
  onPrevDay?: () => void
  onNextDay?: () => void
  canGoNext?: boolean
  steamId?: string | null
  isToday?: boolean
}

const AchievementDisplay: React.FC<Props> = ({
  achievements,
  primaryIdx = 0,
  onSelectAchievement,
  onPrevDay,
  onNextDay,
  canGoNext = false,
  steamId,
  isToday = true,
}) => {
  // No animation: keep layout stable without fades

  // Keyboard navigation for web/PC
  useEffect(() => {
    // Only add keyboard event listeners in web environments
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          onPrevDay && onPrevDay()
        } else if (e.key === "ArrowRight") {
          if (canGoNext && onNextDay) onNextDay()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
    // No-op cleanup for native environments
    return () => {}
  }, [canGoNext, onPrevDay, onNextDay])

  // PanResponder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) =>
      Math.abs(gestureState.dx) > 20,
    onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (gestureState.dx < -50) {
        // Swipe left: next day (respect canGoNext)
        if (canGoNext && onNextDay) onNextDay()
      } else if (gestureState.dx > 50) {
        // Swipe right: previous day
        onPrevDay && onPrevDay()
      }
    },
  })

  if (achievements.length === 0) {
    return (
      <View style={styles.inlineContainer}>
        <View style={[styles.card, styles.cardMin]} {...panResponder.panHandlers}>
          <View style={styles.cardInnerCenter}>
            <Text style={styles.emptyText}>
              {isToday ? "No achievements earned yet today." : "No achievements were earned on this day."}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // Single unified rendering for 1+ achievements.
  // Clamp primary index to avoid out-of-range on data changes.
  const safeIdx = Math.min(Math.max(primaryIdx, 0), achievements.length - 1)
  const primary = achievements[safeIdx]

  return (
    <View style={styles.inlineContainer}>
      <View style={[styles.card, styles.cardMin]} {...panResponder.panHandlers}>
        {/* Date is shown in HomeScreen header */}
        {/* Primary achievement row */}
        <View style={styles.firstRow}>
          <View style={[styles.singleIconContainer, styles.shadowPrimary]}>
            <Image source={{ uri: primary.iconUrl }} style={styles.singleIcon} />
          </View>
        </View>
        <View style={styles.multiInfo}>
          {!!primary.gameName && (
            <Text
              style={styles.gameTitle}
              accessibilityRole="link"
              onPress={() => {
                if (primary.gameId && steamId) {
                  const isNumeric = /^\d+$/.test(String(steamId))
                  const base = isNumeric ? "https://steamcommunity.com/profiles" : "https://steamcommunity.com/id"
                  const url = `${base}/${steamId}/stats/${primary.gameId}/achievements`
                  Linking.openURL(url).catch(() => {})
                }
              }}
            >
              {primary.gameName}
            </Text>
          )}
          <Text style={styles.name}>{primary.name}</Text>
          <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {primary.description}
          </Text>
        </View>
        {achievements.length > 1 && (
          <>
            <View style={styles.infoSpacer} />
            {/* All achievements in one row; dim non-selected */}
            <View style={styles.achRow}>
              {achievements.map((ach: Achievement, idx: number) => (
                <TouchableOpacity
                  key={ach.id}
                  style={styles.multiItem}
                  onPress={() => onSelectAchievement && onSelectAchievement(idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconFrame}>
                    <Image
                      source={{ uri: ach.iconUrl }}
                      style={[
                        styles.multiIcon,
                        {
                          opacity: idx === safeIdx ? 1 : 0.4,
                          borderColor: idx === safeIdx ? "#1976d2" : "#444",
                          borderWidth: idx === safeIdx ? 2 : 1,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    marginHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardMin: {
    minHeight: 420,
  },
  cardInnerCenter: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 48,
    textAlign: "center",
  },
  infoSpacer: {
    height: 24,
  },
  firstRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  achRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  inlineContainer: {
    width: "100%",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
  singleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  singleIcon: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: "#444",
  },
  singleIconContainer: {
    marginBottom: 24,
    borderRadius: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976d2",
    textAlign: "center",
    marginBottom: 2,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    minHeight: 60,
  },
  meta: {
    fontSize: 15,
    color: "#333",
    marginTop: 4,
    textAlign: "center",
  },
  metaValue: {
    color: "#1976d2",
    fontWeight: "bold",
  },
  // Removed vertical centering to keep card flush under the date label on Home
  multiItem: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  multiIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#444",
  },
  iconFrame: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    // Subtle shadow for mini icons
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  multiInfo: {
    marginTop: 16,
    alignItems: "center",
  },
  // Stronger shadow for the primary icon
  shadowPrimary: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: "#1976d2",
  },
  bottomRowSpacer: {
    height: 64,
    marginBottom: 8,
  },
})

export default AchievementDisplay
