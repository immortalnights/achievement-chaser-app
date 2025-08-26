import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import dayjs, { Dayjs } from "dayjs"
import React, { useEffect, useState } from "react"
import { Modal, NativeModules, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type Props = {
  visible: boolean
  initialDate: Dayjs
  onCancel: () => void
  onSubmit: (date: Dayjs) => void
}

export default function SelectDateModal({ visible, initialDate, onCancel, onSubmit }: Props) {
  // Use native picker only if the module is available at runtime
  const hasNativePicker = Platform.OS !== "web" && !!(NativeModules as any)?.RNCDatePicker
  const [selected, setSelected] = useState<Dayjs>(initialDate)
  const [textFallback, setTextFallback] = useState<string>(initialDate.format("YYYY-MM-DD"))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setSelected(initialDate)
      setTextFallback(initialDate.format("YYYY-MM-DD"))
      setError(null)
    }
  }, [visible, initialDate])

  const handleChange = (_e: DateTimePickerEvent, date?: Date) => {
    if (date) {
      const d = dayjs(date)
      setSelected(d)
      setTextFallback(d.format("YYYY-MM-DD"))
      if (error) setError(null)
    }
  }

  const handleSubmit = () => {
  if (Platform.OS === "web" || !hasNativePicker) {
      const parsed = dayjs(textFallback)
      if (!parsed.isValid()) {
        setError("Enter a valid date as YYYY-MM-DD")
        return
      }
      onSubmit(parsed)
      return
    }
    onSubmit(selected)
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select a date</Text>
          <Text style={styles.modalHelp}>Enter a date as YYYY-MM-DD</Text>
      {Platform.OS === "web" || !hasNativePicker ? (
            <TextInput
              value={textFallback}
              onChangeText={(t) => {
                setTextFallback(t)
                if (error) setError(null)
              }}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.modalInput}
            />
          ) : (
            <View style={styles.pickerWrap}>
        <DateTimePicker
                mode="date"
                value={selected.toDate()}
                onChange={handleChange}
                display={Platform.OS === "ios" ? "inline" : "calendar"}
              />
            </View>
          )}
          {!!error && <Text style={styles.modalError}>{error}</Text>}
          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.modalBtn, styles.modalBtnGhost, pressed && styles.pressed]}
            >
              <Text style={styles.modalBtnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [styles.modalBtn, styles.modalBtnPrimary, pressed && styles.pressed]}
            >
              <Text style={styles.modalBtnPrimaryText}>Go</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  modalHelp: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: "#111827",
  },
  pickerWrap: {
    marginTop: 4,
    borderWidth: Platform.OS === "ios" ? 0 : 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalError: {
    color: "#dc2626",
    marginTop: 6,
    textAlign: "center",
  },
  modalActions: {
    marginTop: 12,
  flexDirection: "row",
  justifyContent: "flex-end",
  },
  modalBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  marginLeft: 8,
  },
  modalBtnGhost: {
    backgroundColor: "transparent",
  },
  modalBtnGhostText: {
    color: "#374151",
    fontWeight: "600",
  },
  modalBtnPrimary: {
    backgroundColor: "#2563eb",
  },
  modalBtnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
})
