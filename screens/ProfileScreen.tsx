import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Profile</Text>
      <Text>Your Steam profile and settings.</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  logoutBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  logoutText: {
    color: "#333",
    fontSize: 16,
  },
});

export default ProfileScreen;
