import React, { useLayoutEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MenuImage from "../../components/MenuImage/MenuImage";
import { searchMealsByName, getMealDetailsById, extractIngredients } from "../../data/mealApi";

export default function SearchScreen(props) {
  const { navigation } = props;
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <MenuImage onPress={() => navigation.openDrawer()} />,
      headerRight: () => <View />,
      title: "Search",
    });
  }, []);

  const handleSearch = async (text) => {
    setValue(text);
    if (text.trim() === "") {
      setData([]);
    } else {
      const results = await searchMealsByName(text);
      setData(results || []);
    }
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

  const onPressIngredient = () => {
    navigation.navigate("IngredientScreen", {
      ingredients: ingredients, // Truyền nguyên liệu đến IngredientScreen
      title: item.title, // Truyền tiêu đề công thức
    });
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
          {item.strCategory}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 }}>
      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: 20,
          paddingHorizontal: 15,
          paddingVertical: 8,
          marginVertical: 15,
        }}
      >
        <Image
          source={require("../../../assets/icons/search.png")}
          style={{ width: 20, height: 20, tintColor: "#888", marginRight: 8 }}
        />
        <TextInput
          style={{ flex: 1, fontSize: 16 }}
          placeholder="Search for a meal..."
          value={value}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Image
              source={require("../../../assets/icons/close.png")}
              style={{ width: 18, height: 18, tintColor: "#888" }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderRecipes}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      ) : value.trim() !== "" ? (
        <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
          No meals found.
        </Text>
      ) : null}
    </View>
  );
}