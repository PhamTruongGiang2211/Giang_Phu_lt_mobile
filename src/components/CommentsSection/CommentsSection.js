import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../../screens/firebase";

export default function CommentsSection({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [userName, setUserName] = useState("Anonymous");

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "recipes", recipeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setComments(data.comments || []);
      }

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.username) setUserName(data.username);
        }
      }
    };

    fetchData();
  }, [recipeId]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleString("en-US");

  const handleCommentSubmit = async () => {
    const user = auth.currentUser;
    if (!user || newComment.trim() === "") return;

    const comment = {
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
      comments: arrayUnion(comment),
    });

    setComments([...comments, comment]);
    setNewComment("");
    setReplyTo(null);
  };

  const toggleLike = async (commentId) => {
    const user = auth.currentUser;
    if (!user) return;

    const updated = comments.map((c) =>
      c.id === commentId
        ? {
            ...c,
            likes: c.likes.includes(user.uid)
              ? c.likes.filter((id) => id !== user.uid)
              : [...c.likes, user.uid],
          }
        : c
    );

    setComments(updated);
    const docRef = doc(db, "recipes", recipeId);
    await updateDoc(docRef, { comments: updated });
  };

  const deleteComment = async (commentId) => {
    const filtered = comments.filter(
      (c) => c.id !== commentId && c.parentId !== commentId
    );
    const docRef = doc(db, "recipes", recipeId);
    await updateDoc(docRef, { comments: filtered });
    setComments(filtered);
  };

  const renderComment = (comment, level = 0) => {
    const replies = comments.filter((c) => c.parentId === comment.id);
    const isOwner = comment.userId === auth.currentUser?.uid;

    return (
      <View
        key={comment.id}
        style={{ marginBottom: 12, marginLeft: level * 20 }}
      >
        <Text style={{ fontWeight: "bold" }}>
          {comment.username}{" "}
          <Text style={{ color: "gray", fontSize: 12 }}>
            {formatTime(comment.timestamp)}
          </Text>
        </Text>
        <Text>
          {comment.replyTo && (
            <Text style={{ color: "gray", fontStyle: "italic" }}>
              Reply to {comment.replyTo}:{" "}
            </Text>
          )}
          {comment.text}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => toggleLike(comment.id)}>
            <Ionicons
              name="heart"
              size={16}
              color={
                comment.likes.includes(auth.currentUser?.uid)
                  ? "red"
                  : "gray"
              }
            />
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 8 }}>{comment.likes.length}</Text>
          <TouchableOpacity onPress={() => setReplyTo(comment)}>
            <Text style={{ color: "#007AFF" }}>Reply</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={() => deleteComment(comment.id)}>
              <Text style={{ color: "red", marginLeft: 10 }}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        {replies.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              setShowReplies((prev) => ({
                ...prev,
                [comment.id]: !prev[comment.id],
              }))
            }
          >
            <Text style={{ color: "#007AFF" }}>
              {showReplies[comment.id]
                ? "Hide replies"
                : `View ${replies.length} replies`}
            </Text>
          </TouchableOpacity>
        )}
        {showReplies[comment.id] &&
          replies.map((r) => renderComment(r, level + 1))}
      </View>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parentId);
  const totalReplies = comments.length - topLevelComments.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          {topLevelComments.length} Comments | {totalReplies} Replies
        </Text>
        <FlatList
          data={topLevelComments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderComment(item)}
          style={{ flex: 1 }}
        />
      </View>

      {replyTo && (
        <View style={styles.replyContainer}>
          <Text>
            Replying to:{" "}
            <Text style={{ fontWeight: "bold" }}>{replyTo.username}</Text>
          </Text>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Text style={{ color: "red" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleCommentSubmit}
          style={styles.sendButton}
        >
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  replyContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});
