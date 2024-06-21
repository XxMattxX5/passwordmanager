import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import Slider from "@react-native-community/slider";
import { FontAwesome6 } from "@expo/vector-icons";
import StatusMessage from "@/components/StatusMessage";
import Collapsible from "react-native-collapsible";
import * as Clipboard from "expo-clipboard";

export default function Generator() {
  const { height, width } = useWindowDimensions(); // Window height and width
  const [base, setBase] = useState(""); // Base for password generation
  const [letters, setLetters] = useState(false); // Include letters in generated password
  const [numbers, setNumbers] = useState(false); // Include numbers in generated password
  const [specialCharacters, setSpecialCharacters] = useState(false); // Include special characters in generated password
  const [trailing, setTrailing] = useState(1); // Number of trailing characters
  const [generatedPass, setGeneratedPass] = useState(""); // Generated password
  const [copied, setCopied] = useState(false); // Copied status

  // Copies generated password to user clipboard
  async function copyToClipboard() {
    setCopied(true);
    await Clipboard.setStringAsync(generatedPass);
  }

  // Generates a password
  function generatePassword() {
    if (!letters && !numbers && !specialCharacters) {
      return;
    }

    let trailers = "";
    if (letters) trailers += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) trailers += "0123456789";
    if (specialCharacters) trailers += "!@#$%^&?";

    // Gets trailing characters and adds them to base
    let result = base;
    for (let i = 0; i < trailing; i++) {
      result += trailers.charAt(Math.floor(Math.random() * trailers.length));
    }
    setGeneratedPass(result);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      style={styles.generator_container}
    >
      <View
        style={[
          styles.generator_box,
          { paddingHorizontal: width < 600 ? 10 : 50 },
        ]}
      >
        <Text style={{ textAlign: "center", fontSize: 35, marginBottom: 20 }}>
          Generate a Password
        </Text>
        <TextInput
          style={styles.password_base}
          placeholder="Enter password base"
          placeholderTextColor="#919191"
          onChangeText={setBase}
        />
        <Slider
          maximumValue={20}
          minimumValue={1}
          value={trailing}
          onValueChange={setTrailing}
          step={1}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          <Text>Trailing Characters: {trailing}</Text>
          <View
            style={{
              marginLeft: "auto",
              display: "flex",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <View style={styles.checkbox_box}>
              <Checkbox
                value={letters}
                onValueChange={setLetters}
                style={styles.checkbox}
              />
              <Text style={styles.checkbox_text}>A-Z</Text>
            </View>
            <View style={styles.checkbox_box}>
              <Checkbox
                style={styles.checkbox}
                value={numbers}
                onValueChange={setNumbers}
              />
              <Text style={styles.checkbox_text}>0-9</Text>
            </View>
            <View style={styles.checkbox_box}>
              <Checkbox
                style={styles.checkbox}
                value={specialCharacters}
                onValueChange={setSpecialCharacters}
              />
              <Text style={styles.checkbox_text}>!@#</Text>
            </View>
          </View>
        </View>

        <Button title="Generate Password" onPress={generatePassword} />

        {generatedPass ? (
          <View style={styles.generated_password_box}>
            <Text style={styles.generated_password}> {generatedPass}</Text>

            <FontAwesome6
              onPress={copyToClipboard}
              style={styles.copy_icon}
              name="copy"
              size={24}
              color="black"
            />
          </View>
        ) : null}
        <Collapsible collapsed={copied == false}>
          <StatusMessage
            severity="success"
            statusMessage="Password Copied!"
            style={{ marginTop: 10 }}
            onClear={() => setCopied(false)}
          />
        </Collapsible>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  generator_container: {},
  generator_box: {
    maxWidth: 700,
    width: "95%",
    marginHorizontal: "auto",
    backgroundColor: "white",

    paddingVertical: 30,

    borderRadius: 8,
  },
  password_base: {
    marginBottom: 20,

    paddingVertical: 5,
    fontSize: 21,
    borderBottomWidth: 1,
  },
  checkbox_box: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  checkbox: {},
  checkbox_text: {},
  generate_button_box: {},
  generated_password_box: {
    marginTop: 15,

    backgroundColor: "#dbd8d8",
    position: "relative",
  },
  generated_password: {
    textAlign: "center",
    fontSize: 21,
    borderWidth: 1,
    paddingVertical: 5,
  },
  copy_icon: {
    borderWidth: 1,
    position: "absolute",
    backgroundColor: "white",
    right: 0,
    bottom: 0,
    top: 0,

    paddingTop: Platform.OS === "android" ? 7 : undefined,
    paddingHorizontal: 5,
    paddingLeft: Platform.OS === "android" ? 10 : undefined,
    alignContent: Platform.OS === "android" ? undefined : "center",

    cursor: "pointer",
  },
  copy_message: {},
});
