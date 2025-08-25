import AsyncStorage from "@react-native-async-storage/async-storage"

const ACCOUNTS_KEY = "accounts"
const ACTIVE_KEY = "activeSteamId"
const LEGACY_KEY = "steamId"

export async function getAccounts(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY)
    const list: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? (list as string[]) : []
  } catch {
    return []
  }
}

export async function setAccounts(list: string[]): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(Array.from(new Set(list))))
}

export async function getActiveSteamId(): Promise<string | null> {
  // Migrate legacy single-account key if present
  const [active, legacy] = await Promise.all([AsyncStorage.getItem(ACTIVE_KEY), AsyncStorage.getItem(LEGACY_KEY)])
  if (active) return active
  if (legacy) {
    // migrate legacy -> accounts/active
    await addAccount(legacy)
    await AsyncStorage.removeItem(LEGACY_KEY)
    return legacy
  }
  return null
}

export async function setActiveSteamId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_KEY, id)
}

export async function addAccount(id: string): Promise<void> {
  const cur = await getAccounts()
  if (!cur.includes(id)) {
    cur.push(id)
    await setAccounts(cur)
  }
  await setActiveSteamId(id)
}

export async function removeAccount(id: string): Promise<void> {
  const cur = await getAccounts()
  const next = cur.filter((x) => x !== id)
  await setAccounts(next)
  const active = await AsyncStorage.getItem(ACTIVE_KEY)
  if (active === id) {
    // choose another active or clear
    const fallback = next[0] ?? null
    if (fallback) await setActiveSteamId(fallback)
    else await AsyncStorage.removeItem(ACTIVE_KEY)
  }
}
