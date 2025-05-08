import React, { useLayoutEffect, useEffect, useState } from "react";
import { FlatList, Text, View, Image, TouchableOpacity } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { getAllCategories, getMealDetailsById, extractIngredients } from "../../data/mealApi";

export default function CategoriesScreen(props) {
  const { navigation } = props;
  const [categories, setCategories] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleStyle: {
        fontWeight: "bold",
        textAlign: "center",
        alignSelf: "center",
        flex: 1,
      },
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerRight: () => <View />,
    });
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  const onPressCategory = (item) => {
    navigation.navigate("RecipesList", {
      category: item.strCategory,
      title: item.strCategory,
      description: item.strCategoryDescription, // thêm dòng này
    });
  };


  const renderCategory = ({ item }) => (
    <TouchableOpacity onPress={() => onPressCategory(item)}>
      <View style={styles.categoriesItemContainer}>
        <Image style={styles.categoriesPhoto} source={{ uri: item.strCategoryThumb }} />
        <Text style={styles.categoriesName}>{item.strCategory}</Text>
        <Text style={styles.categoriesInfo}>{item.strCategoryDescription?.slice(0, 50)}...</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.idCategory}
      />
    </View>
  );
}