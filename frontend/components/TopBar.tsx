import {
  StyleSheet,
  Text,
  View,
  Button,
  useWindowDimensions,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { useAuth } from "@/components/useAuth";

export default function TopBar() {
  const { authenticated, user, logoutUser } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  let { height, width } = useWindowDimensions();
  const [displayUserMenu, setDisplayUserMenu] = useState(false);

  async function handleLogout() {
    logoutUser();
  }

  function toggleUserMenu() {
    setDisplayUserMenu(displayUserMenu ? false : true);
  }

  return (
    <View style={[styles.top_bar, { paddingTop: insets.top + 10 }]}>
      <View style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <Text
          style={[styles.top_bar_text, { fontSize: width < 900 ? 20 : 25 }]}
        >
          Password Manager
        </Text>
        {authenticated ? (
          <View style={styles.logged_in_box}>
            <Pressable onPress={toggleUserMenu}>
              <View style={styles.username_box}>
                <Text style={styles.username}>{user}</Text>
                <AntDesign
                  style={styles.username_arrow}
                  name="caretdown"
                  size={12}
                  color="black"
                />
              </View>
            </Pressable>
            {displayUserMenu ? (
              <View style={styles.logged_in_dropdown}>
                <View style={styles.dropdown_content}>
                  <View style={styles.logout_button}>
                    <Button onPress={handleLogout} title="Logout" />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.login_button}>
            <Button
              title="Login"
              onPress={() => {
                navigation.navigate("Login" as never);
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top_bar: {
    backgroundColor: "#23262B",
    paddingLeft: "3%",
    display: "flex",
    flexDirection: "row",
    zIndex: 1,
    padding: 10,
  },
  top_bar_text: {
    color: "white",
    marginVertical: "auto",
  },
  login_button: {
    marginLeft: "auto",
    marginRight: "3%",
    marginBottom: 2,
  },
  logged_in_box: {
    marginLeft: "auto",
    marginRight: "3%",
    marginVertical: "auto",
    position: "relative",
  },
  username_box: {
    display: "flex",
    flexDirection: "row",
    columnGap: 5,
  },
  username: {
    color: "white",
    fontSize: 21,
  },
  username_arrow: {
    color: "white",
    alignSelf: "center",
  },
  logged_in_dropdown: {
    position: "relative",
  },
  dropdown_content: {
    position: "absolute",
    backgroundColor: "#23262B",
    right: 0,

    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logout_button: {
    width: 100,
    marginHorizontal: "auto",
  },
});
