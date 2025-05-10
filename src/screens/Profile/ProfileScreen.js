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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import BookmarkButton from "../../components/BookMarkButton/BookMarkButton.js";

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
      ),
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

  const handleToggleFavorite = async (mealToToggle) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentFavorites = userSnap.data().favoriteMeals || [];
        const exists = currentFavorites.some(
          (fav) => fav.idMeal === mealToToggle.idMeal
        );
        const updatedFavorites = exists
          ? currentFavorites.filter((fav) => fav.idMeal !== mealToToggle.idMeal)
          : [...currentFavorites, mealToToggle];

        await updateDoc(userRef, { favoriteMeals: updatedFavorites });
        setFavoriteMeals(updatedFavorites);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("App", {
          screen: "Main",
          params: {
            screen: "Recipe",
            params: { item },
          },
        })
      }
      style={styles.mealCard}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
      <Text style={styles.mealName} numberOfLines={1}>
        {item.strMeal}
      </Text>
      <View style={styles.favoriteIcon}>
        <BookmarkButton
          meal={item}
          favorites={favoriteMeals || []}
          onToggle={handleToggleFavorite}
        />
      </View>
    </TouchableOpacity>
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

        <Text style={styles.sectionHeader}>Marked Meals</Text>
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
  },
});
