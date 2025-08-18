import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from "dayjs";

export const GameListItem = ({ item, styles }) => {
  const [error, setError] = React.useState(false);
  return (
    <View style={styles.gameRow}>
      {item.iconUrl && !error ? (
        <Image
          source={{ uri: item.iconUrl }}
          style={styles.gameIcon}
          onError={() => setError(true)}
        />
      ) : (
        <View style={[styles.gameIcon, { justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialIcons name="help-outline" size={40} color="#888" />
        </View>
      )}
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.name}</Text>
        {item.achievementCount > 0 && (
          <>
            <Text style={styles.gameMeta}>
              Achievements: <Text style={styles.metaValue}>
                {item.unlocked} of {item.achievementCount}
                {item.unlocked > 0 && ` (${((item.unlocked / item.achievementCount) * 100).toFixed(2)}%)`}
              </Text>
            </Text>
            <Text style={styles.gameMeta}>
              Difficulty: <Text style={styles.metaValue}>{item.difficultyPercentage ? Number(item.difficultyPercentage).toFixed(2) : "0.00"}%</Text>
            </Text>
          </>
        )}
        <Text style={styles.gameMeta}>
          Last Played: <Text style={styles.metaValue}>
            {dayjs(item.lastPlayed).isValid() ? (
              <>
                {dayjs(item.lastPlayed).format('LLL')} (<Text style={styles.metaValue}>{dayjs(item.lastPlayed).fromNow()}</Text>)
              </>
            ) : (
              'Never played'
            )}
          </Text>
        </Text>
      </View>
    </View>
  );
};
