import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  addAccount as addAccountUtil,
  getAccounts as getAccountsUtil,
  getActiveSteamId as getActiveSteamIdUtil,
  removeAccount as removeAccountUtil,
  setActiveSteamId as setActiveSteamIdUtil,
} from "../utils/accounts"

type AccountContextValue = {
  accounts: string[]
  activeSteamId: string | null
  loading: boolean
  refresh: () => Promise<void>
  setActive: (id: string) => Promise<void>
  addAccount: (id: string) => Promise<void>
  removeAccount: (id: string) => Promise<void>
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<string[]>([])
  const [activeSteamId, setActiveSteamIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [list, active] = await Promise.all([getAccountsUtil(), getActiveSteamIdUtil()])
      setAccounts(list)
      setActiveSteamIdState(active)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // no subscription needed; consumers call provided methods that refresh state
  }, [])

  const value = useMemo<AccountContextValue>(
    () => ({
      accounts,
      activeSteamId,
      loading,
      refresh: load,
      setActive: async (id: string) => {
        await setActiveSteamIdUtil(id)
        await load()
      },
      addAccount: async (id: string) => {
        await addAccountUtil(id)
        await load()
      },
      removeAccount: async (id: string) => {
        await removeAccountUtil(id)
        await load()
      },
    }),
    [accounts, activeSteamId, loading]
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error("useAccount must be used within AccountProvider")
  return ctx
}
