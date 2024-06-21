import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function Footer() {
  return (
    <View style={styles.content_container}>
      <Text>Footer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content_container: {
    height: "100%",
    width: "100%",
    backgroundColor: "blue",
  },
});
