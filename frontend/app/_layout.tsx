import React from "react";
import TopBar from "@/components/TopBar";
import Main from "./Main";
import { UserProvider } from "@/components/useAuth";
import { ScrollView } from "react-native";

export default function RootLayout() {
  return (
    <UserProvider>
      <Main />
    </UserProvider>
  );
}
