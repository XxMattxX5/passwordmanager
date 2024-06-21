import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import StatusMessage from "@/components/StatusMessage";
import { useAuth } from "@/components/useAuth";
import Collapsible from "react-native-collapsible";
import axios, { AxiosError } from "axios";
import { getCalendars } from "expo-localization";
import { formatDistanceToNowStrict } from "date-fns";
import config from "@/config";

export default function Profile() {
  const { height, width } = useWindowDimensions();
  const { token, logoutUser } = useAuth();
  const userTimezone = getCalendars()[0].timeZone;
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [folderCount, setFolderCount] = useState(0);
  const [accountCount, setAccountCount] = useState(0);
  const [created, setCreated] = useState<null | string>(null);

  useEffect(() => {
    fetchProfileInfo();
  }, []);
  
  // Fetchs user's profile information
  async function fetchProfileInfo() {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/get_profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsername(response.data.username);
      setNewUsername(response.data.username);
      setEmail(response.data.email);
      setNewEmail(response.data.email);
      setFolderCount(response.data.folder_count);
      setAccountCount(response.data.account_count);
      setCreated(response.data.created);
    } catch (error) {
      logoutUser();
    }
  }

  // Updates user information if inputs a valid
  async function updateUserInfo() {
    if (
      (newUsername == username && newEmail == email) ||
      !newUsername ||
      !newEmail
    ) {
      return;
    }

    try {
      const response = await axios.patch(
        `${config.API_URL}/api/profile`,
        {
          username: newUsername,
          email: newEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchProfileInfo();
      setSuccessMsg(response.data.msg);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 401) {
          logoutUser();
          return;
        }
        const errorMessage = error.response?.data?.msg ?? "Something Failed";
        setErrorMsg(errorMessage);
      } else if (error instanceof Error) {
        const errorMessage = error.message;
        console.error(errorMessage);
      }
    }
  }

  // Clears error and success messages
  function clearMessages() {
    setErrorMsg("");
    setSuccessMsg("");
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <View style={styles.profile_container}>
        <View
          style={[
            styles.user_info_container,
            { width: width < 900 ? "100%" : 300 },
          ]}
        >
          <Text style={styles.info_header}>User Information</Text>
          <Text style={styles.info_text}>Username: {username} </Text>
          <Text style={styles.info_text}>Email: {email} </Text>
          <Text style={styles.info_text}>Folders: {folderCount}</Text>
          <Text style={styles.info_text}>Accounts: {accountCount}</Text>
         {created ? (
            <Text style={[styles.info_created, styles.info_text]}>
              Created:
              {" " +
                formatDistanceToNowStrict(new Date(created + "Z"), {
                  addSuffix: true,
                })}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.change_user_info_container,
            { width: width < 900 ? "100%" : 300 },
          ]}
        >
          <Text style={styles.change_info_header}>Change User Information</Text>
          <View style={styles.change_info_input_box}>
            <Text style={styles.change_info_input_label}>Username</Text>
            <TextInput
              style={styles.change_info_input_text}
              value={newUsername}
              onChangeText={setNewUsername}
            />
          </View>
          <View style={styles.change_info_input_box}>
            <Text style={styles.change_info_input_label}>Email</Text>
            <TextInput
              style={styles.change_info_input_text}
              value={newEmail}
              onChangeText={setNewEmail}
            />
          </View>
          <Collapsible collapsed={successMsg === ""}>
            <StatusMessage
              style={{ marginBottom: 20 }}
              statusMessage={successMsg}
              severity={"success"}
              onClear={clearMessages}
            />
          </Collapsible>
          <Collapsible collapsed={errorMsg === ""}>
            <StatusMessage
              style={{ marginBottom: 20 }}
              statusMessage={errorMsg}
              severity={"failure"}
              onClear={clearMessages}
            />
          </Collapsible>
          <View>
            <Button title="Save Changes" onPress={updateUserInfo}></Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profile_container: {
    maxWidth: 900,
    width: "95%",
    marginHorizontal: "auto",
    borderRadius: 8,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 30,
  },
  user_info_container: {
    padding: 30,
    borderRadius: 8,
    backgroundColor: "white",
  },
  info_header: { fontSize: 30, textAlign: "center", marginBottom: 30 },
  info_created: {},
  info_text: { fontSize: 21, marginBottom: 20 },
  change_user_info_container: {
    padding: 30,
    borderRadius: 8,
    backgroundColor: "white",
    flexGrow: 1,
  },
  change_info_header: { fontSize: 35, textAlign: "center", marginBottom: 30 },
  change_info_input_box: { marginBottom: 20 },
  change_info_input_label: { fontSize: 25 },
  change_info_input_text: {
    fontSize: 22,
    borderBottomWidth: 1,
    color: "#919191",
  },
});
