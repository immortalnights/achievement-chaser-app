import React, { useEffect, useRef } from "react"
import type { GestureResponderEvent, PanResponderGestureState } from "react-native"
import { Animated, Image, Linking, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native"

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
}

const AchievementDisplay: React.FC<Props> = ({
  achievements,
  primaryIdx = 0,
  onSelectAchievement,
  onPrevDay,
  onNextDay,
  canGoNext = false,
  steamId,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Animate fade on date change
  useEffect(() => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }, [achievements, fadeAnim])

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
      <Animated.View
        style={[styles.emptyContainer, { opacity: fadeAnim, userSelect: "none" }]}
        {...panResponder.panHandlers}
      >
        {/* Date is shown in HomeScreen header */}
        <Text style={styles.emptyText}>No achievements earned for this day!</Text>
      </Animated.View>
    )
  }

  if (achievements.length === 1) {
    const achievement = achievements[0]
    return (
      <Animated.View
        style={[styles.singleContainer, { opacity: fadeAnim, userSelect: "none" }]}
        {...panResponder.panHandlers}
      >
        {/* Date is shown in HomeScreen header */}
        <Image source={{ uri: achievement.iconUrl }} style={styles.singleIcon} />
        {!!achievement.gameName && (
          <Text
            style={styles.gameTitle}
            accessibilityRole="link"
            onPress={() => {
              if (achievement.gameId && steamId) {
                const isNumeric = /^\d+$/.test(String(steamId))
                const base = isNumeric ? "https://steamcommunity.com/profiles" : "https://steamcommunity.com/id"
                const url = `${base}/${steamId}/stats/${achievement.gameId}/achievements`
                Linking.openURL(url).catch(() => {})
              }
            }}
          >
            {achievement.gameName}
          </Text>
        )}
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
          {achievement.description}
        </Text>
        <View style={styles.infoSpacer} />
        {/* Preserve space where the bottom row would be */}
        <View style={[styles.achRow, styles.bottomRowSpacer]} />
      </Animated.View>
    )
  }

  // Multiple achievements: show primary, and a single row below with all achievements (non-selected dimmed)
  const primary = achievements[primaryIdx]

  return (
    <Animated.View
      style={[styles.multiContainer, { opacity: fadeAnim, userSelect: "none" }]}
      {...panResponder.panHandlers}
    >
      {/* Date is shown in HomeScreen header */}
      {/* Primary achievement row */}
      <View style={styles.firstRow}>
        <Image source={{ uri: primary.iconUrl }} style={styles.singleIcon} />
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
                    opacity: idx === primaryIdx ? 1 : 0.4,
                    borderColor: idx === primaryIdx ? "#1976d2" : "#444",
                    borderWidth: idx === primaryIdx ? 2 : 1,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#444",
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
  multiContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
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
  },
  multiInfo: {
    marginTop: 16,
    alignItems: "center",
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
