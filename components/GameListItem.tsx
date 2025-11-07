import { MaterialIcons } from "@expo/vector-icons"
import dayjs from "dayjs"
import { request } from "graphql-request"
import React, { useEffect, useMemo, useState } from "react"
import { Image, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import config from "../config"
import { playerUnlockedAchievements } from "../graphql/documents"

const API_URL = config.API_URL

function LastPlayedText({ lastPlayed, isSmall }: { lastPlayed: string; isSmall: boolean }) {
  // If the date is not this year, include the year in the display
  const isThisYear = dayjs(lastPlayed).isSame(dayjs(), "year")
  const formatString = isThisYear ? "ddd, D MMM" : "ddd, D MMM YYYY"
  const formatTime = isSmall ? "" : ", h:mm A"

  return isSmall ? (
    <Text>
      {dayjs(lastPlayed).format(formatString)}{" "}
      <Text style={{ fontWeight: "normal" }}>({dayjs(lastPlayed).fromNow()})</Text>
    </Text>
  ) : (
    <Text>
      {dayjs(lastPlayed).format(`${formatString}${formatTime}`)}{" "}
      <Text style={{ fontWeight: "normal" }}>({dayjs(lastPlayed).fromNow()})</Text>
    </Text>
  )
}

export const GameListItem = ({ item, styles, steamId }: { item: any; styles: any; steamId?: string | null }) => {
  const [error, setError] = useState(false)
  const [recent, setRecent] = useState<{ id: string; iconUrl: string }[]>([])
  const { width } = useWindowDimensions()
  const isSmall = width <= 420
  // Compute how many 32px icons fit with ~10px padding per item, approximating 48px horizontal gutters
  const ICON_SIZE = 32
  const ITEM_PADDING = 10
  const H_GUTTERS = 48 // list + card padding approximation (12 + 12 + 12 + 12)
  const available = Math.max(0, width - H_GUTTERS)
  const smallFitCount = Math.max(1, Math.floor(available / (ICON_SIZE + ITEM_PADDING)))
  const desiredCount = isSmall ? smallFitCount : 5
  const canLinkIcon = Boolean(steamId && item?.id && Number(item?.achievementCount) > 0)

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
    // Skip request if player hasn't unlocked any achievements for this game (or missing ids)
    if (!steamId || !item?.id || !(Number(item?.unlocked) > 0)) {
      setRecent([])
      return () => {
        ignore = true
      }
    }
    request(API_URL, playerUnlockedAchievements, {
      player: steamId,
      game: Number(item.id),
      orderBy: "-datetime",
      limit: desiredCount,
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
  }, [steamId, item?.id, item?.unlocked, desiredCount])

  return (
    <View style={styles.gameRow}>
      <View style={localStyles.cardBody}>
        {/* Small screens: title spans the top across icon + metadata */}
        {isSmall && (
          <Text
            style={[styles.gameName, { marginBottom: 8 }]}
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
        )}
        {/* Top row: icon + main info */}
        <View style={localStyles.topRow}>
          {item.iconUrl && !error ? (
            canLinkIcon ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => {
                  if (item?.id && steamId) {
                    const isNumeric = /^\d+$/.test(String(steamId))
                    const base = isNumeric ? "https://steamcommunity.com/profiles" : "https://steamcommunity.com/id"
                    const url = `${base}/${steamId}/stats/${item.id}/achievements`
                    Linking.openURL(url).catch(() => {})
                  }
                }}
              >
                <Image source={{ uri: item.iconUrl }} style={styles.gameIcon} onError={() => setError(true)} />
              </Pressable>
            ) : (
              <Image source={{ uri: item.iconUrl }} style={styles.gameIcon} onError={() => setError(true)} />
            )
          ) : canLinkIcon ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                if (item?.id && steamId) {
                  const isNumeric = /^\d+$/.test(String(steamId))
                  const base = isNumeric ? "https://steamcommunity.com/profiles" : "https://steamcommunity.com/id"
                  const url = `${base}/${steamId}/stats/${item.id}/achievements`
                  Linking.openURL(url).catch(() => {})
                }
              }}
            >
              <View style={[styles.gameIcon, { justifyContent: "center", alignItems: "center" }]}>
                <MaterialIcons name="help-outline" size={40} color="#888" />
              </View>
            </Pressable>
          ) : (
            <View style={[styles.gameIcon, { justifyContent: "center", alignItems: "center" }]}>
              <MaterialIcons name="help-outline" size={40} color="#888" />
            </View>
          )}
          <View style={styles.gameInfo}>
            {!isSmall && (
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
                  <LastPlayedText lastPlayed={item.lastPlayed} isSmall={isSmall} />
                ) : (
                  "Never played"
                )}
              </Text>
            </Text>
            {item.difficultyPercentage != null && (
              <Text style={styles.gameMeta}>
                Difficulty: <Text style={styles.metaValue}>{Number(item.difficultyPercentage).toFixed(2)}%</Text>
              </Text>
            )}
          </View>
        </View>
        {/* Footer: achievements summary + progress + recent icons */}
        {item.achievementCount > 0 &&
          (isSmall ? (
            <View style={localStyles.footerCol}>
              <View style={[localStyles.progressBlock, { width: "100%" }]}>
                <Text style={styles.gameMeta}>
                  Achievements:{" "}
                  <Text style={styles.metaValue}>
                    {item.unlocked} of {item.achievementCount} ({percent.toFixed(2)}%)
                  </Text>
                </Text>
                <View style={localStyles.progressBar}>
                  <View style={[localStyles.progressFill, { width: `${percent}%` }]} />
                </View>
              </View>
              <View
                style={[
                  localStyles.recentAchRow,
                  { width: "100%", minWidth: 0, marginTop: 8, justifyContent: "flex-start", flexWrap: "wrap" },
                ]}
              >
                {recent.slice(0, desiredCount).map((a) => (
                  <Image
                    key={a.id}
                    source={{ uri: a.iconUrl }}
                    style={[localStyles.achIcon, { marginLeft: 0, marginHorizontal: 5, marginBottom: 8 }]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={localStyles.footerRow}>
              <View style={localStyles.progressBlock}>
                <Text style={styles.gameMeta}>
                  Achievements:{" "}
                  <Text style={styles.metaValue}>
                    {item.unlocked} of {item.achievementCount} ({percent.toFixed(2)}%)
                  </Text>
                </Text>
                <View style={localStyles.progressBar}>
                  <View style={[localStyles.progressFill, { width: `${percent}%` }]} />
                </View>
              </View>
              <View
                style={[
                  localStyles.recentAchRow,
                  {
                    minWidth: 32 * desiredCount + 8 * (desiredCount - 1),
                    justifyContent: "flex-start",
                    flexWrap: "wrap",
                  },
                ]}
              >
                {recent.slice(0, desiredCount).map((a) => (
                  <Image key={a.id} source={{ uri: a.iconUrl }} style={localStyles.achIcon} />
                ))}
              </View>
            </View>
          ))}
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
  },
  footerCol: {
    width: "100%",
    marginTop: 12,
    flexDirection: "column",
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
    // minWidth computed per-screen where needed for layout stability
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
