import dayjs from "dayjs"
import React, { useEffect, useRef } from "react"
import type { GestureResponderEvent, PanResponderGestureState } from "react-native"
import { Animated, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export type Achievement = {
  id: string
  name: string
  description: string
  iconUrl: string
}

type Props = {
  achievements: Achievement[]
  date: any
  setDate: (d: any) => void
  primaryIdx?: number
  onSelectAchievement?: (idx: number) => void
}

const AchievementDisplay: React.FC<Props> = ({ achievements, date, setDate, primaryIdx = 0, onSelectAchievement }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current
  const today = dayjs()
  const isToday = date.isSame(today, "day")
  // Format date as 'Monday, 18th August'
  const day = date.date()
  const month = date.format("MMMM")
  const weekday = date.format("dddd")
  function ordinalSuffix(n: number) {
    if (n > 3 && n < 21) return "th"
    switch (n % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }
  const todayStr = `${weekday}, ${day}${ordinalSuffix(day)} ${month}`

  // Animate fade on date change
  useEffect(() => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }, [date, fadeAnim])

  // Keyboard navigation for web/PC
  useEffect(() => {
    // Only add keyboard event listeners in web environments
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          setDate((prev: any) => prev.subtract(1, "day"))
        } else if (e.key === "ArrowRight" && !isToday) {
          setDate((prev: any) => {
            const next = prev.add(1, "day")
            return next.isAfter(today, "day") ? prev : next
          })
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
    // No-op cleanup for native environments
    return () => {}
  }, [isToday, today, setDate])

  // PanResponder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) =>
      Math.abs(gestureState.dx) > 20,
    onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (gestureState.dx < -50 && !isToday) {
        // Swipe left: next day (not beyond today)
        setDate((prev: any) => {
          const next = prev.add(1, "day")
          return next.isAfter(today, "day") ? prev : next
        })
      } else if (gestureState.dx > 50) {
        // Swipe right: previous day
        setDate((prev: any) => prev.subtract(1, "day"))
      }
    },
  })

  if (achievements.length === 0) {
    return (
      <Animated.View
        style={[styles.emptyContainer, { opacity: fadeAnim, userSelect: "none" }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.date}>{todayStr}</Text>
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
        <Text style={styles.date}>{todayStr}</Text>
        <Image source={{ uri: achievement.iconUrl }} style={styles.singleIcon} />
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
      <Text style={styles.date}>{todayStr}</Text>
      {/* Primary achievement row */}
      <View style={styles.firstRow}>
        <Image source={{ uri: primary.iconUrl }} style={styles.singleIcon} />
      </View>
      <View style={styles.multiInfo}>
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
    padding: 12,
  },
  singleIcon: {
    width: 96,
    height: 96,
    marginBottom: 0,
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
