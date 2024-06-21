import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ImageBackground,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StatusMessage from "@/components/StatusMessage";
import Collapsible from "react-native-collapsible";
import { Link } from "expo-router";
import React, { useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "@/components/useAuth";

export default function Login() {
  const { loginUser } = useAuth(); // User authentication tools
  const headerHeight = useHeaderHeight(); // Height of header
  const TabBarHeight = useBottomTabBarHeight(); // Height of tabbar
  const { height, width } = useWindowDimensions(); // Window height and width
  const [username, setUsername] = useState(""); // login username
  const [password, setPassword] = useState(""); // login password
  const [loginError, setLoginError] = useState(""); // Error message for login
  const [showPassword, setShowPassword] = useState(false); // Hides password

  // Logs user in if there login credentials are correct
  async function handleLogin() {
    if (!username || !password) {
      return;
    }

     loginUser(username, password).then((response) => {
      try {
        let locked_until = new Date(response + "Z").toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        if (locked_until == "Invalid Date") {
          throw "Error message";
        }
        setLoginError("Account locked until: " + locked_until);
      } catch (error) {
        setLoginError(response);
      }
    });
  }

  // Clears login error message
  function clearLoginError() {
    setLoginError("");
  }

  return (
    <ScrollView>
      <View
        style={{
          height: height - headerHeight - TabBarHeight,
        }}
      >
        <View style={styles.login_container}>
          <View
            style={[styles.login_box, { width: width < 900 ? "95%" : "100%" }]}
          >
            <View
              style={[
                styles.welcome_box,
                { display: width < 900 ? "none" : "flex" },
              ]}
            >
              <ImageBackground
                style={{ width: "100%", height: "100%" }}
                source={require("@/assets/images/Login_Bank.jpg")}
              >
                <View style={styles.welcome_box_content}>
                  <Text style={styles.welcome_header}>Welcome Back</Text>
                  <Text style={styles.welcome_message}>
                    Please log in to manage your passwords safely and securely.
                    Keep all your passwords in one secure place.
                  </Text>
                </View>
              </ImageBackground>
            </View>
            <View
              style={[
                styles.login_block,
                { width: width < 900 ? "100%" : "50%" },
              ]}
            >
              <Text style={styles.login_block_header}>Sign In</Text>
              <TextInput
                placeholder="Enter username..."
                placeholderTextColor="#919191"
                value={username}
                onChangeText={setUsername}
                style={styles.login_block_username}
              />
              <View>
                <TextInput
                  placeholder="Enter password..."
                  placeholderTextColor="#919191"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.login_block_password}
                  secureTextEntry={!showPassword}
                  textContentType={"password"}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(showPassword ? false : true)}
                  style={styles.show_password_icon}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
              <Collapsible
                style={styles.errorMessage_box}
                collapsed={loginError === ""}
              >
                <StatusMessage
                  style={styles.errorMessage_box}
                  statusMessage={loginError}
                  severity="failure"
                  onClear={clearLoginError}
                />
              </Collapsible>
              <View style={styles.login_button}>
                <Button title="Login" onPress={handleLogin}></Button>
              </View>
              <View style={styles.register_box}>
                <Text style={styles.register_text}>Don't have an Account:</Text>

                <Link href="/Register" style={styles.register_link}>
                  Register
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  login_container: {
    marginVertical: "auto",
  },
  login_box: {
    display: "flex",
    flexDirection: "row",
    maxWidth: 1000,
    height: 500,

    flexGrow: 1,
    marginHorizontal: "auto",
    borderWidth: 1,
  },
  welcome_box: { width: "50%" },
  welcome_box_content: {
    paddingHorizontal: 20,
    marginVertical: "auto",

    width: "90%",
    marginHorizontal: "auto",
  },
  welcome_header: {
    fontSize: 55,
    color: "white",
    lineHeight: 60,
    marginBottom: 15,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    textShadowColor: "#000000",
    fontWeight: "bold",
  },
  welcome_message: {
    fontSize: 25,
    color: "white",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
    textShadowColor: "#000000",
  },
  login_block: {
    backgroundColor: "white",
    paddingHorizontal: "5%",
    justifyContent: "center",
  },
  title: {
    fontSize: 45,
    textAlign: "center",
    marginBottom: 50,
  },
  login_block_header: {
    fontSize: 40,
    marginBottom: 15,
  },
  login_block_username: {
    borderBottomWidth: 1,
    marginBottom: 30,
    fontSize: 30,
  },

  login_block_password: {
    borderBottomWidth: 1,
    marginBottom: 30,
    fontSize: 30,
    position: "relative",
  },
  show_password_icon: {
    position: "absolute",
    right: 5,
    display: "flex",
    marginTop: 7,
  },
  errorMessage_box: {
    marginBottom: 10,
  },
  login_button: {},
  register_box: {
    display: "flex",
    flexDirection: "row",
    columnGap: 5,
    marginTop: 10,
  },
  register_text: {
    fontSize: 17,
  },
  register_link: {
    color: "#0000EE",
    fontSize: 17,
  },
});
