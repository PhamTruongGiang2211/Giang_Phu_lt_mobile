import React, { useLayoutEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import styles from "./styles"; // Đảm bảo bạn chỉ sử dụng import này

export default function RecipeScreen(props) {
  const { navigation, route } = props;
  const item = route.params?.item;
  const [ingredients, setIngredients] = useState(item.ingredients); // Lưu nguyên liệu vào state

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

  const onPressIngredient = () => {
    navigation.navigate("IngredientScreen", {
      ingredients: ingredients, // Truyền nguyên liệu đến IngredientScreen
      title: item.title, // Truyền tiêu đề công thức
    });
  };

  return (
    // Bao bọc nội dung trong ScrollView
    <ScrollView style={styles.container}>
      <View>
        {/* Công thức, ảnh, mô tả */}
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
        <Text style={styles.recipeDescription}>{item.strInstructions}</Text>

        {/* Nút hiển thị nguyên liệu */}
        <TouchableOpacity style={styles.ingredientButton} onPress={onPressIngredient}>
          <Text style={styles.ingredientButtonText}>View Ingredients</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}