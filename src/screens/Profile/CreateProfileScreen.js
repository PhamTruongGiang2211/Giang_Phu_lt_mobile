import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import DropDownPicker from "react-native-dropdown-picker";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function CreateProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode = "create", profile = {} } = route.params || {};

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");

  const [gender, setGender] = useState("male");
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderItems, setGenderItems] = useState([
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ]);

  useEffect(() => {
    if (mode === "edit" && profile) {
      setUsername(profile.username || "");
      setFullName(profile.fullName || "");
      setLocation(profile.location || "");
      setAge(profile.age?.toString() || "");
      setBio(profile.bio || "");
      setGender(profile.gender || "male");
    }
  }, [mode, profile]);

  const validateUsername = (text) => /^[a-zA-Z0-9_]{3,}$/.test(text);

  const handleSaveProfile = async () => {
    if (!username.trim() || !fullName.trim() || !location.trim() || !bio.trim()) {
      Alert.alert("Validation Error", "Please fill out all fields.");
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert("Invalid Username", "Use at least 3 characters: letters, numbers, underscores.");
      return;
    }

    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber < 13 || ageNumber > 120) {
      Alert.alert("Invalid Age", "Enter a valid age between 13 and 120.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is logged in");

      await setDoc(
        doc(db, "users", user.uid),
        {
          username,
          fullName,
          location,
          gender,
          age: ageNumber,
          bio,
          ...(mode === "create"
            ? { createdAt: new Date().toISOString() }
            : { updatedAt: new Date().toISOString() }),
        },
        { merge: true }
      );

      Alert.alert("Success", mode === "edit" ? "Profile updated." : "Profile created.");
      navigation.replace("App");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const formData = [
    {
      key: "title",
      render: () => (
        <Text style={styles.title}>
          {mode === "edit" ? "Edit Your Profile" : "Create Your Profile"}
        </Text>
      ),
    },
    {
      key: "username",
      render: () => (
        <TextInput
          style={styles.input}
          placeholder="Username (e.g. john_doe123)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      ),
    },
    {
      key: "fullName",
      render: () => (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
      ),
    },
    {
      key: "location",
      render: () => (
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
      ),
    },
    {
      key: "genderLabel",
      render: () => <Text style={styles.label}>Gender</Text>,
    },
    {
      key: "genderPicker",
      render: () => (
        <DropDownPicker
          open={genderOpen}
          value={gender}
          items={genderItems}
          setOpen={setGenderOpen}
          setValue={setGender}
          setItems={setGenderItems}
          style={styles.dropdown}
          zIndex={5000}
          zIndexInverse={6000}
          placeholder="Select gender"
        />
      ),
    },
    {
      key: "age",
      render: () => (
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          maxLength={3}
        />
      ),
    },
    {
      key: "bio",
      render: () => (
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Tell us about yourself"
          multiline
          value={bio}
          onChangeText={setBio}
        />
      ),
    },
    {
      key: "button",
      render: () => (
        <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
          <Text style={styles.buttonText}>
            {mode === "edit" ? "Update Profile" : "Save Profile"}
          </Text>
        </TouchableOpacity>
      ),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <FlatList
              data={formData}
              renderItem={({ item }) => item.render()}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
