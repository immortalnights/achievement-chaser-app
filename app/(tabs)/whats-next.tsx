import { request } from "graphql-request"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { GameListItem } from "../../components/GameListItem"
import ScreenContainer from "../../components/ScreenContainer"
import config from "../../config"
import { useAccount } from "../../context/AccountContext"
import { playerGames } from "../../graphql/documents"

const API_URL = config.API_URL

export default function WhatsNext() {
  const [steamId, setSteamId] = useState<string | null>(null)
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { activeSteamId } = useAccount()
  useEffect(() => {
    setSteamId(activeSteamId)
  }, [activeSteamId])

  const fetchGames = useCallback((opts?: { refresh?: boolean }) => {
    if (!steamId) return
    if (opts?.refresh) setRefreshing(true)
    else setLoading(true)
    request(API_URL, playerGames, {
      player: steamId,
      incomplete: true,
      orderBy: "-game_DifficultyPercentage",
      limit: 12,
    })
      .then((data: any) => {
        const edges = data?.player?.games?.edges || []
        const nextGames: any[] = edges.map((edge: any) => {
          const g = edge.node.game
          return {
            id: g.id,
            name: g.name,
            iconUrl: `https://media.steampowered.com/steam/apps/${g.id}/capsule_184x69.jpg`,
            achievementCount: g.achievementCount,
            difficultyPercentage: g.difficultyPercentage,
            lastPlayed: edge.node.lastPlayed,
            unlocked: edge.node.unlockedAchievementCount,
            playtimeForever: edge.node.playtimeForever,
            completed: edge.node.completed,
          }
        })
        setGames(nextGames)
      })
      .finally(() => {
        if (opts?.refresh) setRefreshing(false)
        else setLoading(false)
      })
  }, [steamId])

  useEffect(() => {
    if (!steamId) return
    fetchGames()
  }, [steamId, fetchGames])

  return (
    <ScreenContainer>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GameListItem item={item} styles={styles} steamId={steamId} />}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchGames({ refresh: true })} />}
        />
      )}
    </ScreenContainer>
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
  headerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  gameIcon: {
    width: 184,
    height: 69,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#333",
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gameMeta: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  metaValue: {
    color: "#1976d2",
    fontWeight: "bold",
  },
})
