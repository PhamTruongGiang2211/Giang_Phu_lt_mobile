import React, { useLayoutEffect, useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import MenuImage from "../../components/MenuImage/MenuImage";
import axios from "axios";
import { getMealDetailsById, extractIngredients } from "../../data/mealApi";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen(props) {
  const { navigation } = props;
  const [meals, setMeals] = useState([]);
  const [popularMeals, setPopularMeals] = useState([]);
  const [popularIngredients, setPopularIngredients] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <MenuImage onPress={() => navigation.openDrawer()} />,
      headerRight: () => <View />,
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allMeals = [];
        const alphabet = "abcdefghijklmnopqrstuvwxyz";

        for (let char of alphabet) {
          const response = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`
          );
          if (response.data.meals) {
            allMeals = allMeals.concat(response.data.meals);
          }
        }

        setMeals(allMeals);

        const randomPopularMeals = getRandomItems(allMeals, 20);
        setPopularMeals(randomPopularMeals);

        const ingredients = allMeals.flatMap((meal) => extractIngredients(meal));

        const ingredientCount = ingredients.reduce((acc, ingredient) => {
          acc[ingredient.name] = (acc[ingredient.name] || 0) + 1;
          return acc;
        }, {});

        const sortedIngredients = Object.entries(ingredientCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)
          .map((item) => ({
            name: item.name,
            count: item.count,
            image: `https://www.themealdb.com/images/ingredients/${item.name}.png`,
          }));

        const randomPopularIngredients = getRandomItems(sortedIngredients, 20);
        setPopularIngredients(randomPopularIngredients);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu món ăn:", error);
      }
    };

    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) return;

          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().favoriteMeals) {
            setFavorites(userSnap.data().favoriteMeals);
          } else {
            setFavorites([]);
          }
        } catch (error) {
          console.error("Lỗi khi tải danh sách yêu thích:", error);
        }
      };

      loadFavorites();
    }, [])
  );

  const getRandomItems = (arr, count) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  const onPressRecipe = async (item) => {
    const fullData = await getMealDetailsById(item.idMeal);
    if (fullData && fullData.length > 0) {
      const meal = fullData[0];
      const ingredients = extractIngredients(meal);
      meal.ingredients = ingredients;
      meal.title = meal.strMeal;
      navigation.navigate("Recipe", { item: meal });
    }
  };

  const onPressIngredient = async (ingredient) => {
    try {
      navigation.navigate("IngredientsDetails", {
        ingredientName: ingredient.name,
      });
    } catch (error) {
      console.error("Lỗi khi điều hướng tới IngredientsDetailsScreen:", error);
    }
  };

  const toggleFavorite = async (meal) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let favorites = [];
      if (userSnap.exists() && userSnap.data().favoriteMeals) {
        favorites = userSnap.data().favoriteMeals;
      }

      const exists = favorites.some((fav) => fav.idMeal === meal.idMeal);
      let updatedFavorites;

      if (exists) {
        updatedFavorites = favorites.filter((fav) => fav.idMeal !== meal.idMeal);
      } else {
        updatedFavorites = [...favorites, meal];
      }

      await updateDoc(userRef, { favoriteMeals: updatedFavorites });
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
    }
  };

  const renderRecipeItem = ({ item }) => {
    const isFavorite = favorites.some((fav) => fav.idMeal === item.idMeal);

    return (
      <View style={styles.gridItem}>
        <TouchableOpacity
          onPress={() => onPressRecipe(item)}
          style={{ width: "100%" }}
        >
          <Image style={styles.photo} source={{ uri: item.strMealThumb }} />
          <Text style={styles.title}>{item.strMeal}</Text>
          <Text style={styles.category}>Recipe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteIconWrapper}
          onPress={() => toggleFavorite(item)}
        >
          <View style={styles.heartBackground}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "red" : "gray"}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderIngredientItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onPressIngredient(item)}
      style={styles.gridItem}
    >
      <Image style={styles.photo} source={{ uri: item.image }} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.category}>Used in {item.count} meals</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSectionHeader({ title: "All Meals" })}
      <FlatList
        data={meals}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => item.idMeal + "_" + index}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContainer}
        horizontal={false}
      />

      {renderSectionHeader({ title: "Popular Meals" })}
      <FlatList
        data={popularMeals}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => item.idMeal + "_" + index}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContainer}
        horizontal={false}
      />

      {renderSectionHeader({ title: "Popular Ingredients" })}
      <FlatList
        data={popularIngredients}
        renderItem={renderIngredientItem}
        keyExtractor={(item, index) => item.name + "_" + index}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContainer}
        horizontal={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    alignItems: "center",
    padding: 10,
    minHeight: 150,
    position: "relative",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
  photo: {
    width: "100%",
    height: 100,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  category: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionHeader: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  flatListContainer: {
    marginBottom: 20,
  },
  favoriteIconWrapper: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  heartBackground: {
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
