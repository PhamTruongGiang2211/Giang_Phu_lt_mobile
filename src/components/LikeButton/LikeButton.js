// components/LikeButton.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../../screens/firebase";

export default function LikeButton({ recipeId }) {
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const fetchLikes = async () => {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLikes(docSnap.data().likes || []);
      }
    };

    fetchLikes();
  }, [recipeId]);

  const handleLike = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Cần đăng nhập", "Bạn cần đăng nhập để thích công thức.");
      return;
    }

    const userId = user.uid;
    const docRef = doc(db, "recipes", recipeId);

    if (likes.includes(userId)) {
      await updateDoc(docRef, {
        likes: arrayRemove(userId),
      });
      setLikes((prev) => prev.filter((id) => id !== userId));
    } else {
      await updateDoc(docRef, {
        likes: arrayUnion(userId),
      });
      setLikes((prev) => [...prev, userId]);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLike}
      style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
    >
      <Ionicons
        name="heart"
        size={24}
        color={likes.includes(auth.currentUser?.uid) ? "red" : "gray"}
      />
      <Text style={{ marginLeft: 8 }}>{likes.length}</Text>
    </TouchableOpacity>
  );
}
