import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../screens/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [favoriteMeals, setFavoriteMeals] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "My Profile",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
          <Image
            source={require("../../../assets/icons/backArrow.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.replace("App")}
          style={{ marginRight: 15 }}
        >
          <Image
            source={require("../../../assets/icons/home.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFavoriteMeals(data.favoriteMeals || []);
        } else {
          Alert.alert("No Profile Found", "Please create your profile.");
          navigation.replace("CreateProfile");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = async (meal) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let currentFavorites = [];
      if (userSnap.exists()) {
        currentFavorites = userSnap.data().favoriteMeals || [];
      }

      const exists = currentFavorites.some((m) => m.idMeal === meal.idMeal);
      const updatedFavorites = exists
        ? currentFavorites.filter((m) => m.idMeal !== meal.idMeal)
        : [...currentFavorites, meal];

      await updateDoc(userRef, { favoriteMeals: updatedFavorites });
      setFavoriteMeals(updatedFavorites);
    } catch (err) {
      console.error("Failed to update favorite meals:", err);
    }
  };

  const renderMealItem = ({ item }) => (
    <View style={styles.mealCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Recipe", { item })}
      >
        <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
        <Text style={styles.mealName} numberOfLines={1}>
          {item.strMeal}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.favoriteIcon}
        onPress={() => toggleFavorite(item)}
      >
        <Ionicons
          name={
            favoriteMeals.some((m) => m.idMeal === item.idMeal)
              ? "heart"
              : "heart-outline"
          }
          size={20}
          color="#e91e63"
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Full Name: </Text>
            {profile.fullName || "Not provided"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Username: </Text>
            {profile.username || "Not provided"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Age: </Text>
            {profile.age || "Not provided"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Gender: </Text>
            {profile.gender || "Not provided"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Location: </Text>
            {profile.location || "Not provided"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Bio: </Text>
            {profile.bio || "Not provided"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("CreateProfile", { mode: "edit", profile })
          }
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Favorite Meals</Text>
        {favoriteMeals.length === 0 ? (
          <Text style={styles.noFavorites}>No favorites yet.</Text>
        ) : (
          <FlatList
            data={favoriteMeals}
            renderItem={renderMealItem}
            keyExtractor={(item) => item.idMeal}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={styles.mealsList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#333",
  },
  editButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  noFavorites: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
  },
  mealsList: {
    paddingBottom: 32,
  },
  mealCard: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    width: "48%",
    position: "relative",
  },
  mealImage: {
    width: "100%",
    height: 100,
  },
  mealName: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 8,
    color: "#333",
  },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
  },
});
