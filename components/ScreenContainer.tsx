import React, { ReactNode } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

export default function ScreenContainer({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={styles.root}>
      <View style={[styles.inner, style]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
  },
})
