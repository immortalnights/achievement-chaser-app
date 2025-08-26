import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  addAccount as addAccountUtil,
  getAccounts as getAccountsUtil,
  getActiveSteamId as getActiveSteamIdUtil,
  removeAccount as removeAccountUtil,
  setActiveSteamId as setActiveSteamIdUtil,
  type Account,
} from "../utils/accounts"

type AccountContextValue = {
  accounts: Account[]
  activeSteamId: string | null
  loading: boolean
  refresh: () => Promise<void>
  setActive: (id: string) => Promise<void>
  addAccount: (id: string, name?: string) => Promise<void>
  removeAccount: (id: string) => Promise<void>
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [activeSteamId, setActiveSteamIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [list, active] = await Promise.all([getAccountsUtil(), getActiveSteamIdUtil()])
      setAccounts(list)
      setActiveSteamIdState(active)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // no subscription needed; consumers call provided methods that refresh state
  }, [load])

  const setActiveCb = useCallback(
    async (id: string) => {
      await setActiveSteamIdUtil(id)
      await load()
    },
    [load]
  )

  const addAccountCb = useCallback(
    async (id: string, name?: string) => {
      await addAccountUtil(id, name)
      await load()
    },
    [load]
  )

  const removeAccountCb = useCallback(
    async (id: string) => {
      await removeAccountUtil(id)
      await load()
    },
    [load]
  )

  const value = useMemo<AccountContextValue>(
    () => ({
      accounts,
      activeSteamId,
      loading,
      refresh: load,
      setActive: setActiveCb,
      addAccount: addAccountCb,
      removeAccount: removeAccountCb,
    }),
    [accounts, activeSteamId, loading, load, setActiveCb, addAccountCb, removeAccountCb]
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error("useAccount must be used within AccountProvider")
  return ctx
}
