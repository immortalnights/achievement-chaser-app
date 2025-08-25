import { ClientError, request } from "graphql-request"
import React, { useEffect, useState } from "react"
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import config from "../config"
import { useAccount } from "../context/AccountContext"
import { searchPlayers } from "../graphql/documents"

type Props = {
  visible: boolean
  onClose: () => void
  onChanged?: () => void // call when active account changed or list updated
}

export default function AccountSwitcher({ visible, onClose, onChanged }: Props) {
  const { accounts, activeSteamId, addAccount, removeAccount, setActive, refresh: refreshAccounts } = useAccount()
  const [newId, setNewId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const API_URL = config.API_URL

  useEffect(() => {
    if (visible) {
      // ensure latest accounts when opening
      refreshAccounts()
    }
  }, [visible, refreshAccounts])

  const handleSwitch = async (id: string) => {
    await setActive(id)
    onChanged && onChanged()
    onClose()
  }

  const handleAdd = async () => {
    const input = newId.trim()
    if (!input) return
    setError(null)
    try {
      const data: any = await request(API_URL, searchPlayers, { name: input })
      const found = data?.player
      if (!found?.id) {
        setError("Unable to find player. Please check the name or ID.")
        return
      }
      await addAccount(String(found.id), found.name || String(found.id))
      setNewId("")
      onChanged && onChanged()
    } catch (e: any) {
      if (e instanceof ClientError || (e && e.response && e.response.errors)) {
        setError("Unable to find player. Please try again.")
      } else {
        setError("Request failed. Please try again.")
      }
    }
  }

  const handleRemove = async (id: string) => {
    await removeAccount(id)
    onChanged && onChanged()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Accounts</Text>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <TouchableOpacity style={styles.rowLeft} onPress={() => handleSwitch(item.id)}>
                  <Text style={[styles.rowText, item.id === activeSteamId && styles.active]}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No accounts yet.</Text>}
          />
          <View style={styles.addWrap}>
            <TextInput
              style={styles.input}
              placeholder="Add Steam ID"
              value={newId}
              onChangeText={setNewId}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rowLeft: { flex: 1 },
  rowText: { fontSize: 16 },
  active: { color: "#1976d2", fontWeight: "700" },
  remove: { color: "#d32f2f", paddingHorizontal: 8 },
  empty: { textAlign: "center", color: "#666", marginVertical: 12 },
  addWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
  errorText: { color: "#d32f2f", textAlign: "center", marginTop: 8 },
  closeBtn: { marginTop: 12, alignSelf: "center" },
  closeText: { color: "#1976d2", fontWeight: "600", fontSize: 16 },
})
