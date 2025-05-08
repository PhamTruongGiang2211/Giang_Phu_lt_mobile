import React, { useLayoutEffect, useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { getMealsByCategory, getMealDetailsById, extractIngredients } from "../../data/mealApi";

export default function RecipesListScreen(props) {
  const { navigation, route } = props;
  const category = route?.params?.category;
  const description = route?.params?.description;
  const [meals, setMeals] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params?.title || "Recipes",
      headerRight: () => <View />,
    });
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      const data = await getMealsByCategory(category);
      setMeals(data || []);
    };
    fetchMeals();
  }, [category]);

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

  const renderRecipes = ({ item }) => (
    <TouchableOpacity
      onPress={() => onPressRecipe(item)}
      style={{
        flex: 1,
        margin: 8,
        backgroundColor: "#fafafa",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: item.strMealThumb }}
        style={{ width: "100%", aspectRatio: 1 }}
        resizeMode="cover"
      />
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
          {item.strMeal}
        </Text>
        <Text style={{ fontSize: 13, color: "#666" }} numberOfLines={1}>
          {category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 }}>
      {description ? (
        <View
          style={{
            backgroundColor: "#f9f9f9",
            padding: 12,
            borderRadius: 12,
            borderColor: "#ddd",
            borderWidth: 1,
            marginTop: 12,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: "#444",
              lineHeight: 22,
              fontStyle: "italic",
            }}
          >
            {description}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={meals}
        renderItem={renderRecipes}
        keyExtractor={(item) => item.idMeal}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
}