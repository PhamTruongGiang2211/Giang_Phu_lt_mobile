import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import DropDownPicker from "react-native-dropdown-picker";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // đảm bảo bạn đã cấu hình Firestore trong firebase.js

const countryCodes = [
  { iso2: "VN", code: "+84", name: "Vietnam" },
  { iso2: "US", code: "+1", name: "USA" },
  { iso2: "GB", code: "+44", name: "UK" },
  { iso2: "AU", code: "+61", name: "Australia" },
  { iso2: "IN", code: "+91", name: "India" },
];

export default function LoginWithPhoneScreen({ navigation }) {
  const [open, setOpen] = useState(false);
  const [countryValue, setCountryValue] = useState("VN");
  const [countryItems, setCountryItems] = useState(
    countryCodes.map((item) => ({
      label: `${item.name} (${item.code})`,
      value: item.iso2,
    }))
  );
  const [localPhone, setLocalPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const sendVerification = async () => {
    const country = countryCodes.find((c) => c.iso2 === countryValue);
    const fullPhone = `${country.code}${localPhone.replace(/^0+/, "")}`;

    const parsed = parsePhoneNumberFromString(fullPhone, countryValue);
    if (!parsed || !parsed.isValid()) {
      Alert.alert("Invalid phone number", "Please enter a valid number.");
      return;
    }

    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const id = await phoneProvider.verifyPhoneNumber(
        parsed.number,
        recaptchaVerifier.current
      );
      setVerificationId(id);
      setResendTimer(60);
      Alert.alert("Verification code sent!");
    } catch (err) {
      Alert.alert("Send failed", err.message);
    }
  };

  const confirmCode = async () => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Kiểm tra xem user đã tạo hồ sơ chưa trong Firestore
      const profileDoc = await getDoc(doc(db, "profiles", user.uid));
      if (profileDoc.exists()) {
        navigation.replace("App");
      } else {
        navigation.replace("CreateProfile");
      }
    } catch (err) {
      Alert.alert("Verification failed", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Login with Phone Number</Text>

          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={auth.app.options}
          />

          <View style={{ marginBottom: 16, zIndex: 1000 }}>
            <Text style={styles.label}>Select Country:</Text>
            <DropDownPicker
              open={open}
              value={countryValue}
              items={countryItems}
              setOpen={setOpen}
              setValue={(callback) => {
                const value = callback(countryValue);
                setCountryValue(value);
              }}
              setItems={setCountryItems}
              searchable={true}
              placeholder="Choose a country"
              style={{
                borderColor: "#ccc",
              }}
              dropDownContainerStyle={{
                borderColor: "#ccc",
              }}
              zIndex={1000}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Phone number (e.g. 912345678)"
            value={localPhone}
            onChangeText={setLocalPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.button, resendTimer > 0 && styles.buttonDisabled]}
            onPress={sendVerification}
            disabled={resendTimer > 0}
          >
            <Text style={styles.buttonText}>
              {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Send verification code"}
            </Text>
          </TouchableOpacity>

          {verificationId && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.button} onPress={confirmCode}>
                <Text style={styles.buttonText}>Verify code</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#aaa", marginTop: 24 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
