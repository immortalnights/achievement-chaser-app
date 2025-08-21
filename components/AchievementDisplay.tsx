import dayjs from "dayjs"
import React, { useEffect, useRef } from "react"
import { Animated, Image, PanResponder, StyleSheet, Text, View } from "react-native"

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string
}

interface Props {
  achievements: Achievement[]
  date: any
  setDate: (d: any) => void
}

const AchievementDisplay: React.FC<Props> = ({ achievements, date, setDate }) => {
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
  }, [date])

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
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
    onPanResponderRelease: (_, gestureState) => {
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
        <Text style={styles.description}>{achievement.description}</Text>
      </Animated.View>
    )
  }

  // Multiple achievements: first on its own row, rest in rows of three
  const first = achievements[0]
  const rest = achievements.slice(1)
  const rows = []
  for (let i = 0; i < rest.length; i += 3) {
    rows.push(rest.slice(i, i + 3))
  }

  return (
    <Animated.View
      style={[styles.multiContainer, { opacity: fadeAnim, userSelect: "none" }]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.date}>{todayStr}</Text>
      {/* First achievement row */}
      <View style={styles.firstRow}>
        <Image source={{ uri: first.iconUrl }} style={styles.singleIcon} />
      </View>
      <View style={styles.multiInfo}>
        <Text style={styles.name}>{first.name}</Text>
        <Text style={styles.description}>{first.description}</Text>
      </View>
      <View style={styles.infoSpacer} />
      {/* Other achievements in rows of three */}
      {rows.map((row, idx) => (
        <View key={idx} style={styles.achRow}>
          {row.map((ach) => (
            <View key={ach.id} style={styles.multiItem}>
              <Image source={{ uri: ach.iconUrl }} style={styles.multiIcon} />
            </View>
          ))}
        </View>
      ))}
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
  },
  multiInfo: {
    marginTop: 16,
    alignItems: "center",
  },
})

export default AchievementDisplay
