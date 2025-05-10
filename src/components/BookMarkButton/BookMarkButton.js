import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookmarkButton({ meal, favorites, onToggle }) {
  const isBookmarked = favorites?.some((favMeal) => favMeal.idMeal === meal.idMeal);
  return (
    <TouchableOpacity
      style={styles.bookmarkIconWrapper}
      onPress={() => onToggle(meal)}
    >
      <View style={styles.bookmarkBackground}>
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={isBookmarked ? "blue" : "gray"}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookmarkIconWrapper: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  bookmarkBackground: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});
