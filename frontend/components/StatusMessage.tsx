import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  useWindowDimensions,
} from "react-native";
import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import { AntDesign } from "@expo/vector-icons";

interface statusMessageProps {
  style?: StyleProp<ViewStyle | TextStyle>;
  statusMessage: string;
  severity?: "success" | "failure";
  onClear?: () => void;
}

export default function StatusMessage({
  onClear,
  severity = "failure",
  statusMessage,
  style,
}: statusMessageProps) {
  const { height, width } = useWindowDimensions();

  return (
    <View
      style={[
        style,
        styles.statusMessage_container,
        { backgroundColor: severity == "success" ? "#c8fbc8" : "#f0b6b6" },
      ]}
    >
      {severity == "success" ? (
        <Feather
          style={[styles.status_icon, { color: "#1e4620" }]}
          name="check-circle"
          size={24}
          color="black"
        />
      ) : (
        <AntDesign
          style={[styles.status_icon, { color: "#5f2120" }]}
          name="exclamationcircleo"
          size={24}
          color="black"
        />
      )}
      <View
        style={{
          width: "100%",
          marginHorizontal: "auto",
          flexDirection: "row",
          flexWrap: "wrap",
          flexShrink: 1,
          minHeight: 50,
          paddingHorizontal: 3,
          alignContent: "center",
        }}
      >
        <Text
          style={[
            styles.message,
            {
              color: severity == "success" ? "#1e4620" : "#5f2120",
              fontSize: width < 900 ? 16 : 18,
            },
          ]}
        >
          {statusMessage}
        </Text>
      </View>
      <FontAwesome6
        style={[
          styles.close_message,
          {
            color: severity == "success" ? "#1e4620" : "#5f2120",
          },
        ]}
        name="xmark"
        size={24}
        color="black"
        onPress={onClear}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusMessage_container: {
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",

    padding: 5,
  },

  status_icon: {
    marginLeft: 20,
  },
  message: {
    marginLeft: 20,
  },
  close_message: { color: "white", marginLeft: "auto", marginRight: 10 },
});
