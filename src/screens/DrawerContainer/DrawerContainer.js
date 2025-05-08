import React from "react";
import { View, Alert } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";
import MenuButton from "../../components/MenuButton/MenuButton";
import { auth } from "../../screens/firebase";
import { signOut } from "firebase/auth";

export default function DrawerContainer(props) {
  const { navigation } = props;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login"); // hoặc navigation.navigate tùy theo cấu trúc app
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <MenuButton
          title="HOME"
          source={require("../../../assets/icons/home.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Home" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="CATEGORIES"
          source={require("../../../assets/icons/category.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Categories" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="SEARCH"
          source={require("../../../assets/icons/search.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Search" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="LOG OUT"
          source={require("../../../assets/icons/backArrow.png")} 
          onPress={handleLogout}
        />
        <MenuButton
          title="PROFILE"
          source={require("../../../assets/icons/info.png")}
          onPress={() => {
            navigation.navigate("Profile");
            navigation.closeDrawer();
          }}
        />
      </View>
    </View>
  );
}

DrawerContainer.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,
  }),
};
