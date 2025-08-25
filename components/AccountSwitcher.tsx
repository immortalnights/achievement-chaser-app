import React, { useEffect, useState } from "react"
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useAccount } from "../context/AccountContext"

type Props = {
  visible: boolean
  onClose: () => void
  onChanged?: () => void // call when active account changed or list updated
}

export default function AccountSwitcher({ visible, onClose, onChanged }: Props) {
  const { accounts, activeSteamId, addAccount, removeAccount, setActive, refresh: refreshAccounts } = useAccount()
  const [newId, setNewId] = useState("")

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
    const id = newId.trim()
    if (!id) return
    await addAccount(id)
    setNewId("")
    onChanged && onChanged()
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
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <TouchableOpacity style={styles.rowLeft} onPress={() => handleSwitch(item)}>
                  <Text style={[styles.rowText, item === activeSteamId && styles.active]}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(item)}>
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
  closeBtn: { marginTop: 12, alignSelf: "center" },
  closeText: { color: "#1976d2", fontWeight: "600", fontSize: 16 },
})
