import AsyncStorage from "@react-native-async-storage/async-storage"

const ACCOUNTS_KEY = "accounts"
const ACTIVE_KEY = "activeSteamId"
const LEGACY_KEY = "steamId"

export type Account = { id: string; name: string }

export async function getAccounts(): Promise<Account[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) {
      // Migration: if array of strings, convert to accounts with name=id
      if (parsed.length > 0 && typeof parsed[0] === "string") {
        const converted = (parsed as string[]).map((id) => ({ id, name: id }))
        await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(converted))
        return converted
      }
      return parsed as Account[]
    }
    return []
  } catch {
    return []
  }
}

export async function setAccounts(list: Account[]): Promise<void> {
  // ensure unique by id
  const map = new Map<string, Account>()
  list.forEach((a) => map.set(a.id, a))
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(Array.from(map.values())))
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

export async function addAccount(id: string, name?: string): Promise<void> {
  const cur = await getAccounts()
  if (!cur.some((a) => a.id === id)) {
    cur.push({ id, name: name || id })
    await setAccounts(cur)
  }
  await setActiveSteamId(id)
}

export async function removeAccount(id: string): Promise<void> {
  const cur = await getAccounts()
  const next = cur.filter((a) => a.id !== id)
  await setAccounts(next)
  const active = await AsyncStorage.getItem(ACTIVE_KEY)
  if (active === id) {
    // choose another active or clear
    const fallback = next[0]?.id ?? null
    if (fallback) await setActiveSteamId(fallback)
    else await AsyncStorage.removeItem(ACTIVE_KEY)
  }
}
