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
import React, { useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import StatusMessage from "@/components/StatusMessage";
import Collapsible from "react-native-collapsible";
import { useAuth } from "@/components/useAuth";
import { MaterialIcons } from "@expo/vector-icons";

export default function Register() {
  const { registerUser, loginUser } = useAuth(); // User athentication tools
  const headerHeight = useHeaderHeight(); // height of header
  const TabBarHeight = useBottomTabBarHeight(); // height of tab bar
  const { height, width } = useWindowDimensions(); // Window height and width
  const [errorMessage, setErrorMessage] = useState(""); // Error message for registration

  const [username, setUsername] = useState(""); // Registration username
  const [email, setEmail] = useState(""); // Registration email
  const [password, setPassword] = useState(""); // Registration password
  const [passwordConfirm, setPasswordConfirm] = useState(""); // Registration password confirm
  const [showPass1, setShowPass1] = useState(false); // Hides password
  const [showPass2, setShowPass2] = useState(false); // Hides passwordConfirm

  // Creates a new user if inputs are valid
  async function register() {
    const response = registerUser(
      username,
      email,
      password,
      passwordConfirm
    ).then((response) => {
      if (response.success) {
        loginUser(username, password);
      } else {
        setErrorMessage(response.failure);
      }
    });
  }

  // Clears success and error messages
  function clearError() {
    setErrorMessage("");
  }

  return (
    <ScrollView>
      <View
        style={{
          height: height - headerHeight - TabBarHeight,
        }}
      >
        <View style={styles.register_container}>
          <View
            style={[
              styles.register_box,
              { width: width < 900 ? "95%" : "100%" },
            ]}
          >
            <View
              style={[
                styles.signup_box,
                { display: width < 900 ? "none" : "flex" },
              ]}
            >
              <ImageBackground
                style={{ width: "100%", height: "100%" }}
                source={require("@/assets/images/Login_Bank.jpg")}
              >
                <View style={styles.signup_box_content}>
                  <Text style={styles.signup_header}>Sign Up Today!</Text>
                  <Text style={styles.signup_message}>
                    Create an Account today and start storing your logins in one
                    safe place.
                  </Text>
                </View>
              </ImageBackground>
            </View>
            <View
              style={[
                styles.register_block,
                { width: width < 900 ? "100%" : "50%" },
              ]}
            >
              <Text style={styles.register_block_header}>Register</Text>
              <TextInput
                placeholder="Enter Username"
                placeholderTextColor="#919191"
                value={username}
                onChangeText={setUsername}
                style={[
                  styles.register_block_username,
                  styles.register_block_input,
                ]}
              />
              <TextInput
                placeholder="Enter Email"
                placeholderTextColor="#919191"
                value={email}
                onChangeText={setEmail}
                style={[
                  styles.register_block_email,
                  styles.register_block_input,
                ]}
              />
              <View>
                <TextInput
                  placeholder="Enter Password"
                  placeholderTextColor="#919191"
                  value={password}
                  onChangeText={setPassword}
                  style={[
                    styles.register_block_password,
                    styles.register_block_input,
                  ]}
                  secureTextEntry={!showPass2}
                  textContentType={"password"}
                />
                <TouchableOpacity
                  onPress={() => setShowPass2(showPass2 ? false : true)}
                  style={styles.show_password_icon}
                >
                  <MaterialIcons
                    name={showPass2 ? "visibility" : "visibility-off"}
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
              </View>

              <View>
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#919191"
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  style={[
                    styles.register_block_confirm,
                    styles.register_block_input,
                  ]}
                  secureTextEntry={!showPass1}
                  textContentType={"password"}
                />
                <TouchableOpacity
                  onPress={() => setShowPass1(showPass1 ? false : true)}
                  style={styles.show_password_icon}
                >
                  <MaterialIcons
                    name={showPass1 ? "visibility" : "visibility-off"}
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
              </View>

              <Collapsible collapsed={errorMessage === ""}>
                <StatusMessage
                  style={styles.error_message}
                  severity="failure"
                  statusMessage={errorMessage}
                  onClear={clearError}
                />
              </Collapsible>

              <View style={styles.register_button}>
                <Button title="Create Account" onPress={register}></Button>
              </View>
              <View />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  register_container: { marginVertical: "auto" },
  register_box: {
    display: "flex",
    flexDirection: "row",
    maxWidth: 1000,
    marginHorizontal: "auto",
    minHeight: 500,
    borderWidth: 1,
  },
  signup_box: { width: "50%" },
  signup_box_content: {
    width: "90%",
    paddingHorizontal: 20,
    margin: "auto",
  },
  signup_header: {
    color: "white",
    fontSize: 55,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    textShadowColor: "#000000",
    fontWeight: "bold",
  },
  signup_message: {
    color: "white",
    fontSize: 25,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
    textShadowColor: "#000000",
  },
  register_block: {
    width: "50%",
    paddingHorizontal: "5%",
    marginVertical: "auto",
  },
  register_block_header: { fontSize: 40, marginBottom: 20 },
  register_block_input: {
    fontSize: 30,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  register_block_username: {},
  register_block_email: {},
  register_block_password: {},
  register_block_confirm: {},
  error_message: { marginBottom: 10 },
  register_button: {},
  show_password_icon: {
    position: "absolute",
    right: 5,
    display: "flex",
    marginTop: 7,
  },
});
