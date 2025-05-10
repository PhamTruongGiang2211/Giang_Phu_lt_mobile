// RecipeScreen.js

import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { firebase, db, auth } from "../../screens/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import styles from "./styles";
import LikeButton from "../../components/LikeButton/LikeButton.js";
import CommentsSection from "../../components/CommentsSection/CommentsSection.js";

export default function RecipeScreen({ navigation, route }) {
  const item = route.params?.item;
  const [ingredients, setIngredients] = useState(item.ingredients || []);
  const [userName, setUserName] = useState("Anonymous");

  const recipeId = item.idMeal;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{ marginRight: 15 }}
        >
          <Image
            source={require("../../../assets/icons/home.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchRecipeDoc = async () => {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          likes: [],
          comments: [],
        });
      }
    };

    const getCurrentUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.username) {
            setUserName(data.username);
          }
        }
      }
    };

    fetchRecipeDoc();
    getCurrentUserName();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <FlatList
        data={[]} // Không cần dữ liệu nếu chỉ dùng header + comment component
        keyExtractor={() => Math.random().toString()}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
            <Text style={styles.recipeDescription}>{item.strInstructions}</Text>

            <TouchableOpacity
              style={styles.ingredientButton}
              onPress={() =>
                navigation.navigate("IngredientScreen", {
                  ingredients: ingredients,
                  title: item.title,
                })
              }
            >
              <Text style={styles.ingredientButtonText}>View Ingredients</Text>
            </TouchableOpacity>

            {/* Component xử lý like */}
            <LikeButton recipeId={recipeId} />

            {/* Component xử lý bình luận */}
            <CommentsSection recipeId={recipeId} userName={userName} />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </KeyboardAvoidingView>
  );
}
