import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getMealDetailsById, extractIngredients } from "../../data/mealApi";

export default function IngredientsDetailsScreen({ route, navigation }) {
  const { ingredientName } = route.params;  // Lấy tên nguyên liệu từ params
  const [meals, setMeals] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: ingredientName });  // Cập nhật tiêu đề màn hình
  }, [navigation, ingredientName]);

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

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        // Gửi request lấy món ăn từ nguyên liệu
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientName}`
        );
        const data = await response.json();
        setMeals(data.meals || []);  // Cập nhật danh sách món ăn
      } catch (error) {
        console.error("Lỗi khi lấy món ăn từ nguyên liệu:", error);
      }
    };

    fetchMeals();
  }, [ingredientName]);  // Khi nguyên liệu thay đổi thì gọi lại API

  const handleMealPress = async (item) => {
    // Lấy chi tiết món ăn khi người dùng nhấn
    const fullData = await getMealDetailsById(item.idMeal);
    if (fullData && fullData.length > 0) {
      const meal = fullData[0];
      const ingredients = extractIngredients(meal);
      meal.ingredients = ingredients;
      meal.title = meal.strMeal;
      navigation.navigate("Recipe", { item: meal });  // Điều hướng tới màn hình chi tiết món ăn
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleMealPress(item)}>
      <Image source={{ uri: item.strMealThumb }} style={styles.image} />
      <Text style={styles.title}>{item.strMeal}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}  // Hiển thị danh sách món ăn
        renderItem={renderItem}  // Hiển thị món ăn
        keyExtractor={(item) => item.idMeal}  // Sử dụng idMeal làm key
        numColumns={2}  // Hiển thị theo dạng lưới 2 cột
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
    flex: 1,
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 120,
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});