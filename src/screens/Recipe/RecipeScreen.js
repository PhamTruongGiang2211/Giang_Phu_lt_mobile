import React, { useLayoutEffect, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import MenuImage from "../../components/MenuImage/MenuImage";
import axios from "axios";
import { getMealDetailsById, extractIngredients } from "../../data/mealApi";

export default function HomeScreen(props) {
  const { navigation } = props;
  const [meals, setMeals] = useState([]);
  const [popularMeals, setPopularMeals] = useState([]);
  const [popularIngredients, setPopularIngredients] = useState([]);
  const [recentlyViewedMeals, setRecentlyViewedMeals] = useState([]);

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

        const mealsWithYoutube = allMeals.filter(
          (meal) => meal.strYoutube && meal.strYoutube.trim() !== ""
        );
        const randomPopularMeals = getRandomItems(mealsWithYoutube, 15);
        setPopularMeals(randomPopularMeals);

        const ingredients = allMeals.flatMap((meal) =>
          extractIngredients(meal)
        );
        const ingredientCount = ingredients.reduce((acc, ingredient) => {
          acc[ingredient.name] = (acc[ingredient.name] || 0) + 1;
          return acc;
        }, {});

        const sortedIngredients = Object.entries(ingredientCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 30)
          .map((item) => ({
            name: item.name,
            count: item.count,
            image: `https://www.themealdb.com/images/ingredients/${item.name}.png`,
          }));

        const randomPopularIngredients = getRandomItems(
          sortedIngredients,
          15
        );
        setPopularIngredients(randomPopularIngredients);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu món ăn:", error);
      }
    };

    fetchData();
  }, []);

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

      setRecentlyViewedMeals((prev) => {
        const filtered = prev.filter((m) => m.idMeal !== meal.idMeal);
        const updated = [meal, ...filtered];
        return updated.slice(0, 10);
      });

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

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onPressRecipe(item)}
      style={styles.gridItem}
    >
      <Image style={styles.photo} source={{ uri: item.strMealThumb }} />
      <Text style={styles.title}>{item.strMeal}</Text>
    </TouchableOpacity>
  );

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
    <ScrollView style={styles.container}>
      {renderSectionHeader({ title: "Popular Meals (with YouTube)" })}
      <FlatList
        data={popularMeals}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => item.idMeal + "_" + index}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContainer}
        scrollEnabled={false}
      />

      {recentlyViewedMeals.length > 0 && (
        <>
          {renderSectionHeader({ title: "Recently Viewed Meals" })}
          <FlatList
            data={recentlyViewedMeals}
            renderItem={renderRecipeItem}
            keyExtractor={(item, index) => item.idMeal + "_recent_" + index}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.flatListContainer}
            scrollEnabled={false}
          />
        </>
      )}

      {renderSectionHeader({ title: "Popular Ingredients" })}
      <FlatList
        data={popularIngredients}
        renderItem={renderIngredientItem}
        keyExtractor={(item, index) => item.name + "_" + index}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContainer}
        scrollEnabled={false}
      />
    </ScrollView>
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
});
