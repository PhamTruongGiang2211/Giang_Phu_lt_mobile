import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";

export default function IngredientScreen(props) {
  const { navigation, route } = props;
  const { ingredients, title } = route.params || {};

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Ingredients" });
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")} // Đảm bảo "Home" là đúng tên màn hình Home của bạn
          style={{ marginRight: 15 }}
        >
          <Image
            source={require("../../../assets/icons/home.png")} // Đường dẫn đến icon home
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onPressIngredient = (ingredientName) => {
    navigation.navigate("IngredientsDetails", {
      ingredientName: ingredientName,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.recipeTitle}>{title || "Unnamed Recipe"}</Text>
      <Text style={styles.subtitle}>List of Ingredients</Text>
      {Array.isArray(ingredients) && ingredients.length > 0 ? (
        ingredients.map((ingredient, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onPressIngredient(ingredient.name)}
            style={styles.ingredientItem}
          >
            <Image
              source={{ uri: ingredient.image }}
              style={styles.ingredientImage}
            />
            <View style={styles.ingredientTextContainer}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientMeasure}>{ingredient.measure}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noIngredients}>No ingredients found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ingredientImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  ingredientTextContainer: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ingredientMeasure: {
    fontSize: 14,
    color: "#777",
  },
  noIngredients: {
    fontSize: 16,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
});
