import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React from "react";

export default function Loading() {
  return (
    <View style={styles.activity_indicator_box}>
      <ActivityIndicator size={150} />
    </View>
  );
}

const styles = StyleSheet.create({
  activity_indicator_box: {
    alignSelf: "center",
    marginVertical: "auto",
  },
});
