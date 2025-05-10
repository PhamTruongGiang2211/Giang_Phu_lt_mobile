import React, { useLayoutEffect } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import Icon from "react-native-vector-icons/Ionicons";

export default function RecipeScreen({ route, navigation }) {
  const { item } = route.params;

  // Cập nhật nút home icon trên header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("HomeTabs")}>
          <Icon name="home-outline" size={24} color="#000" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onPressIngredient = (ingredientName) => {
    navigation.navigate("IngredientsDetails", { ingredientName });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />

      {/* Ingredients Section */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {item.ingredients.map((ingredient, index) => (
        <TouchableOpacity
          key={index}
          style={styles.ingredientButton}
          onPress={() => onPressIngredient(ingredient.name)}
        >
          <Image source={{ uri: ingredient.image }} style={styles.ingredientImage} />
          <Text style={styles.ingredientButtonText}>
            • {ingredient.name} - {ingredient.measure}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Video Tutorial */}
      {item.strYoutube && (
        <>
          <Text style={styles.sectionTitle}>Video Tutorial</Text>
          <View style={styles.videoContainer}>
            <WebView
              source={{ uri: convertYoutubeUrl(item.strYoutube) }}
              style={styles.webview}
              allowsFullscreenVideo
            />
          </View>
        </>
      )}

      {/* Instructions */}
      <Text style={styles.sectionTitle}>Instructions</Text>
      <Text style={styles.recipeDescription}>{formatInstructions(item.strInstructions)}</Text>
    </ScrollView>
  );
}

function convertYoutubeUrl(url) {
  const videoId = url.split("v=")[1]?.split("&")[0];
  return `https://www.youtube.com/embed/${videoId}`;
}

// Thay dấu • bằng khoảng trắng đầu dòng
function formatInstructions(instructions) {
  return instructions
    .split(". ")
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => `  ${sentence}${sentence.endsWith(".") ? "" : "."}`) // Thụt đầu dòng
    .join("\n\n");
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recipeImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  recipeDescription: {
    fontSize: 16,
    color: "gray",
    lineHeight: 24,
    textAlign: "justify",
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  ingredientButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,      // Giảm khoảng cách dọc
    paddingHorizontal: 20,
    marginBottom: 4,         // Giảm khoảng cách giữa các nguyên liệu
    borderRadius: 25,
    backgroundColor: "transparent",
  },
  ingredientImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  ingredientButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  videoContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
});
