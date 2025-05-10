// RecipeScreen.js

import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase, db, auth } from "../../screens/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import styles from "./styles";

export default function RecipeScreen(props) {
  const { navigation, route } = props;
  const item = route.params?.item;
  const [ingredients, setIngredients] = useState(item.ingredients); // Lưu nguyên liệu vào state

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
    const fetchRecipeData = async () => {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikes(data.likes || []);
        setComments(data.comments || []);
      } else {
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

    fetchRecipeData();
    getCurrentUserName();
  }, []);

  const handleLike = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to like recipes.");
      return;
    }

    const userId = user.uid;
    const docRef = doc(db, "recipes", recipeId);

    if (likes.includes(userId)) {
      await updateDoc(docRef, {
        likes: arrayRemove(userId),
      });
      setLikes(likes.filter((id) => id !== userId));
    } else {
      await updateDoc(docRef, {
        likes: arrayUnion(userId),
      });
      setLikes([...likes, userId]);
    }
  };

  const handleCommentSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Login Required", "You must be logged in to comment.");
      return;
    }

    if (newComment.trim() === "") return;

    const commentObj = {
      id: Date.now().toString(),
      text: newComment,
      userId: user.uid,
      username: userName,
      timestamp: Date.now(),
      replyTo: replyTo?.username || null,
      parentId: replyTo?.id || null,
      likes: [],
    };

    const docRef = doc(db, "recipes", recipeId);
    await updateDoc(docRef, {
      comments: arrayUnion(commentObj),
    });

    setComments([...comments, commentObj]);
    setNewComment("");
    setReplyTo(null);
  };

  const handleDeleteComment = async (commentId) => {
    const updatedComments = comments.filter(c => c.id !== commentId && c.parentId !== commentId);
    const docRef = doc(db, "recipes", recipeId);
    await updateDoc(docRef, { comments: updatedComments });
    setComments(updatedComments);
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const toggleCommentLike = async (commentId) => {
    const user = auth.currentUser;
    if (!user) return;

    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const alreadyLiked = c.likes?.includes(user.uid);
        const updatedLikes = alreadyLiked
          ? c.likes.filter((id) => id !== user.uid)
          : [...(c.likes || []), user.uid];
        return { ...c, likes: updatedLikes };
      }
      return c;
    });

    setComments(updated);
    const docRef = doc(db, "recipes", recipeId);
    await updateDoc(docRef, {
      comments: updated,
    });
  const onPressIngredient = (ingredientName) => {
    navigation.navigate("IngredientsDetails", { ingredientName });
  };

  const renderComment = (comment) => {
    const getAllReplies = (parentId) => {
      const directReplies = comments.filter((c) => c.parentId === parentId);
      let all = [...directReplies];
      directReplies.forEach(reply => {
        all = [...all, ...getAllReplies(reply.id)];
      });
      return all;
    };

    const childReplies = getAllReplies(comment.id);
    const replyCount = childReplies.length;
    const isOwnComment = auth.currentUser?.uid === comment.userId;

    return (
      <View key={comment.id} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold" }}>
            {comment.username} <Text style={{ color: "gray", fontSize: 12 }}>{formatTime(comment.timestamp)}</Text>
          </Text>
          {isOwnComment && (
            <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
              <Text style={{ color: "red" }}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text>
          {comment.replyTo && (
            <Text style={{ color: "gray", fontStyle: "italic" }}>Replying to {comment.replyTo}: </Text>
          )}
          {comment.text}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <TouchableOpacity onPress={() => toggleCommentLike(comment.id)} style={{ marginRight: 8 }}>
            <Ionicons
              name="heart"
              size={16}
              color={comment.likes?.includes(auth.currentUser?.uid) ? "red" : "gray"}
            />
          </TouchableOpacity>
          <Text style={{ marginRight: 16 }}>{comment.likes?.length || 0}</Text>

          <TouchableOpacity onPress={() => setReplyTo(comment)}>
            <Text style={{ color: "#007AFF", marginRight: 16 }}>Reply</Text>
          </TouchableOpacity>
          {replyCount > 0 && (
            <TouchableOpacity onPress={() => toggleReplies(comment.id)}>
              <Text style={{ color: "#007AFF" }}>
                {showReplies[comment.id] ? "Hide" : `View ${replyCount} repl${replyCount > 1 ? "ies" : "y"}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showReplies[comment.id] &&
          childReplies.map((reply) => {
            const isOwnReply = auth.currentUser?.uid === reply.userId;
            return (
              <View key={reply.id} style={{ paddingLeft: 16, marginTop: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {reply.username} <Text style={{ color: "gray", fontSize: 12 }}>{formatTime(reply.timestamp)}</Text>
                  </Text>
                  {isOwnReply && (
                    <TouchableOpacity onPress={() => handleDeleteComment(reply.id)}>
                      <Text style={{ color: "red" }}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text>
                  {reply.replyTo && (
                    <Text style={{ color: "gray", fontStyle: "italic" }}>Replying to {reply.replyTo}: </Text>
                  )}
                  {reply.text}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <TouchableOpacity onPress={() => toggleCommentLike(reply.id)} style={{ marginRight: 8 }}>
                    <Ionicons
                      name="heart"
                      size={16}
                      color={reply.likes?.includes(auth.currentUser?.uid) ? "red" : "gray"}
                    />
                  </TouchableOpacity>
                  <Text style={{ marginRight: 16 }}>{reply.likes?.length || 0}</Text>

                  <TouchableOpacity onPress={() => setReplyTo(reply)}>
                    <Text style={{ color: "#007AFF" }}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
      </View>
    );
  };

  const renderHeader = () => (
    <View>
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

      <TouchableOpacity
        onPress={handleLike}
        style={{ marginTop: 16, flexDirection: "row", alignItems: "center" }}
      >
        <Ionicons
          name="heart"
          size={24}
          color={likes.includes(auth.currentUser?.uid) ? "red" : "gray"}
        />
        <Text style={{ marginLeft: 8 }}>{likes.length} Likes</Text>
      </TouchableOpacity>

      <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 24, marginBottom: 8 }}>
        Comments ({comments.filter((c) => !c.parentId).length})
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={{ marginTop: 16, paddingBottom: 40 }}>
      {replyTo && (
        <View style={{ marginBottom: 8 }}>
          <Text>
            Replying to: <Text style={{ fontWeight: "bold" }}>{replyTo.username}</Text>
          </Text>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Text style={{ color: "red" }}>Cancel Reply</Text>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Write a comment..."
        style={{
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 8,
        }}
      />
      <TouchableOpacity onPress={handleCommentSubmit} style={styles.ingredientButton}>
        <Text style={styles.ingredientButtonText}>Submit Comment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <FlatList
        data={comments.filter((c) => !c.parentId)}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => renderComment(item)}
        ListFooterComponent={renderFooter}
      />
    </KeyboardAvoidingView>
  );
}

function convertYoutubeUrl(url) {
  const videoId = url.split("v=")[1]?.split("&")[0];
  return `https://www.youtube.com/embed/${videoId}`;
}

// Thay dấu • bằng khoảng trắng đầu dòng
function formatInstructions(instructions) {
  return instructions
    .split(". ")
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => `  ${sentence}${sentence.endsWith(".") ? "" : "."}`) // Thụt đầu dòng
    .join("\n\n");
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recipeImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  recipeDescription: {
    fontSize: 16,
    color: "gray",
    lineHeight: 24,
    textAlign: "justify",
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  ingredientButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,      // Giảm khoảng cách dọc
    paddingHorizontal: 20,
    marginBottom: 4,         // Giảm khoảng cách giữa các nguyên liệu
    borderRadius: 25,
    backgroundColor: "transparent",
  },
  ingredientImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  ingredientButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  videoContainer: {
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
});}