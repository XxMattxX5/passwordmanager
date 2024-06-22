import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  Animated,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import Passwords from "@/components/Passwords";
import StatusMessage from "@/components/StatusMessage";
import Collapsible from "react-native-collapsible";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FontAwesome5 } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { formatDistanceToNowStrict } from "date-fns";
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/components/useAuth";
import config from "@/config";

type Account = {
  id: number;
  name: string;
  username: string;
  password: string;
  created: string;
};
type Folder = {
  id: number;
  name: string;
  accounts: Array<Account>;
  created: string;
};

export default function App() {
  const { logoutUser, token, decryptPassword } = useAuth(); // User authentication tools
  let { height, width } = useWindowDimensions(); // Window height and width
  const headerHeight = useHeaderHeight(); // Height of header
  const tabBarHeight = useBottomTabBarHeight(); // Height of tabbar
  const [showPassMenu, setShowPassMenu] = useState(width < 900 ? false : true); // Show password menu status
  const [showAccountDetail, setShowAccountDetail] = useState(
    width < 900 ? false : true
  ); // Show account details status
  const [createMenu, setCreateMenu] = useState(false); // Show createMenu status
  const [createType, setCreateType] = useState("account"); // Creation type "account" or "folder"
  const [display, setDisplay] = useState<Account | Folder | null>(null); // Account or folder being displayed
  const [newAccount, setNewAccount] = useState(""); // New account name
  const [newUsername, setNewUsername] = useState(""); // New username
  const [newPass, setNewPass] = useState(""); // New password
  const [newFolderName, setNewFolderName] = useState(""); // New folder name
  const [created, setCreated] = useState(0); // Resets passwords component when folder or account created
  const [successMsg, setSuccessMsg] = useState(""); // Success message for forms
  const [errorMsg, setErrorMsg] = useState(""); // Error message for forms
  const [showPassword, setShowPassword] = useState(false); // Hides passwords

  // Toggles the password menu section
  function togglePassMenu() {
    if (width < 900 && showAccountDetail) {
      detailSlideIn();
      setShowAccountDetail(false);
    }
    showPassMenu == false ? passSlideOut() : passSlideIn();
    setShowPassMenu(showPassMenu == false ? true : false);
  }

  // Toggles the accounts detail sections
  function toggleAccountDetail() {
    if (width < 900 && showPassMenu) {
      passSlideIn();
      setShowPassMenu(false);
    }
    showAccountDetail == false ? detailSlideOut() : detailSlideIn();
    setShowAccountDetail(showAccountDetail == false ? true : false);
  }

  // Adds details of account clicked to display
  function objClicked(obj: Account | Folder | null) {
    setShowPassword(false);
    setCreateMenu(false);
    setDisplay(obj);
    if (!obj) {
      setDisplay(null);
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    if (isAccount(obj)) {
      if (width < 900) {
        togglePassMenu();
      }
      setNewAccount(obj.name);
      setNewUsername(obj.username);
      setNewPass(decryptPassword(obj.password));
    } else {
      setNewFolderName(obj.name);
    }
  }

  // Displays create an account menu
  function displayCreate(type: string) {
    if (width < 900) {
      passSlideIn();
      setShowPassMenu(false);
    }
    setNewAccount("");
    setNewUsername("");
    setNewPass("");
    setNewFolderName("");
    setSuccessMsg("");
    setErrorMsg("");
    setCreateMenu(true);
    setCreateType(type == "account" ? "account" : "folder");
    setShowPassword(false);
  }

  // Makes user confirm they want to delete account or folder
  function deleteAlert() {
    if (!display) {
      return;
    }
    const itemType = isAccount(display) ? "account" : "folder";
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Alert.alert(
        "Delete Item",
        itemType == "account"
          ? `Are you sure you want to delete ${display.name}`
          : `Are you sure you want to delete ${display.name}. Anything inside the folder will be deleted as well.`,
        [
          {
            text: "Cancel",

            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => deleteItem(itemType),
          },
        ]
      );
    } else {
      const response = window.confirm(
        itemType == "account"
          ? `Are you sure you want to delete ${display.name}`
          : `Are you sure you want to delete ${display.name}. Anything inside the folder will be deleted as well.`
      );
      if (response) {
        deleteItem(itemType);
      }
    }
  }

  // Deletes account or folder
  async function deleteItem(type: string) {
    if (!display) {
      return;
    }
    let url: string;
    if (type === "folder") {
      url = `${config.API_URL}/api/folders?id=${display.id}`;
    } else if (type === "account") {
      url = `${config.API_URL}/api/passwords?id=${display.id}`;
    } else {
      return;
    }
    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCreated(created + 1);
      setDisplay(null);
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

  // Creates a new folder if inputs valid
  async function addFolder() {
    if (!newFolderName) {
      return;
    }
    const token = await AsyncStorage.getItem("authToken");
    try {
      const response = await axios.post(
        `${config.API_URL}/api/folders`,
        {
          name: newFolderName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCreated(created + 1);
      setCreateMenu(false);
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

  // Updates existing folder
  async function updateFolder() {
    if (!newFolderName || !display) {
      return;
    }
    const token = await AsyncStorage.getItem("authToken");
    try {
      const response = await axios.patch(
        `${config.API_URL}/api/folders`,
        {
          id: display.id,
          name: newFolderName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrorMsg("");
      setSuccessMsg(response.data.msg);
      setCreated(created + 1);
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

  // Creates new account
  async function addAccount() {
    if (!newPass || !newAccount || !newUsername) {
      return;
    }

    const token = await AsyncStorage.getItem("authToken");
    try {
      const response = await axios.post(
        `${config.API_URL}/api/passwords`,
        {
          account_name: newAccount,
          username: newUsername,
          password: newPass,
          folder_id: isFolder(display) ? display.id : "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      isFolder(display) ? setDisplay(null) : null, setCreated(created + 1);
      setCreateMenu(false);
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

  // Updates existing account
  async function updateAccount() {
    if (!newPass || !newAccount || !newUsername || !display) {
      return;
    }
    const token = await AsyncStorage.getItem("authToken");
    try {
      const response = await axios.patch(
        `${config.API_URL}/api/passwords`,
        {
          id: display.id,
          account_name: newAccount,
          username: newUsername,
          password: newPass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrorMsg("");
      setSuccessMsg(response.data.msg);
      setCreated(created + 1);
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

  // Intialize animation for the passwords sections
  const password_sidebar_offset = Platform.OS === "android" ? -285 : -300 + 40;
  const passSlideAnim = useRef(
    new Animated.Value(width < 900 ? password_sidebar_offset : 0)
  ).current;

  // Slide in animation for the passwords section
  function passSlideIn() {
    Animated.timing(passSlideAnim, {
      toValue: password_sidebar_offset,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  // Slide out animation for the passwords section
  function passSlideOut() {
    Animated.timing(passSlideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  // Initial animation for the accounts details sections
  const detailSlideAnim = useRef(
    new Animated.Value(width < 900 ? -320 : 0)
  ).current;

  // Slide in Animation for the accounts details sections
  function detailSlideIn() {
    Animated.timing(detailSlideAnim, {
      toValue: -320,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  // Slide out Animation for the accounts details sections
  function detailSlideOut() {
    Animated.timing(detailSlideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  // Keeps menus viewable with width change
  useEffect(() => {
    if (width > 900 && showPassMenu == false) {
      togglePassMenu();
    } else if (width < 900 && showPassMenu == true) {
      togglePassMenu();
    }
    if (width > 900 && showAccountDetail == false) {
      toggleAccountDetail();
    } else if (width < 900 && showAccountDetail == true) {
      toggleAccountDetail();
    }
  }, [width]);

  // Checks if displayed object is an account
  const isAccount = (obj: any): obj is Account => {
    return obj && typeof obj.username === "string";
  };

  // Checks if displayed object is a folder
  const isFolder = (obj: any): obj is Folder => {
    return obj && Array.isArray(obj.accounts);
  };

  // Clears error and success message
  function clearMessages() {
    setErrorMsg("");
    setSuccessMsg("");
  }

  // Displays account creation menu
  function renderCreate() {
    return (
      <View style={{ marginVertical: "auto" }}>
        <Text
          style={{
            fontSize: width < 1200 ? 30 : 50,
            marginLeft: 38,
            textAlign: "center",
            width: width < 900 ? width - 40 : undefined,
            alignSelf: "center",
          }}
        >
          {createType == "account" ? "Create an Account" : "Create a Folder"}
          {createType == "account" && isFolder(display)
            ? " in " + display.name
            : null}
        </Text>
        <View style={[styles.account_info, { paddingLeft: 40, width: "100%" }]}>
          <View
            style={[
              styles.display_account,
              { width: width < 900 ? "90%" : "60%" },
            ]}
          >
            <View style={styles.display_box}>
              <Text
                style={[
                  styles.display_label,
                  { fontSize: width < 1200 ? 27 : 37 },
                ]}
              >
                {createType == "account" ? "Account Name" : "Folder Name"}
              </Text>
              <TextInput
                placeholder={
                  createType == "account"
                    ? "Enter account name..."
                    : "Enter folder name..."
                }
                placeholderTextColor="#919191"
                value={createType == "account" ? newAccount : newFolderName}
                style={[
                  styles.display_name,
                  { fontSize: width < 1200 ? 22 : 32 },
                ]}
                onChangeText={
                  createType == "account" ? setNewAccount : setNewFolderName
                }
              />
            </View>
            {createType == "account" ? (
              <>
                <View style={styles.display_box}>
                  <Text
                    style={[
                      styles.display_label,
                      { fontSize: width < 1200 ? 27 : 37 },
                    ]}
                  >
                    Username
                  </Text>
                  <TextInput
                    placeholder="Enter username..."
                    placeholderTextColor="#919191"
                    value={newUsername}
                    style={[
                      styles.display_username,
                      { fontSize: width < 1200 ? 22 : 32 },
                    ]}
                    onChangeText={setNewUsername}
                  />
                </View>
                <View style={styles.display_box}>
                  <Text
                    style={[
                      styles.display_label,
                      { fontSize: width < 1200 ? 27 : 37 },
                    ]}
                  >
                    Password
                  </Text>
                  <TextInput
                    placeholder="Enter password..."
                    placeholderTextColor="#919191"
                    value={newPass}
                    style={[
                      styles.display_password,
                      { fontSize: width < 1200 ? 22 : 32 },
                    ]}
                    onChangeText={setNewPass}
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
              </>
            ) : null}
            <Collapsible collapsed={errorMsg === ""}>
              <StatusMessage
                style={{ marginBottom: 20 }}
                statusMessage={errorMsg}
                severity={"failure"}
                onClear={clearMessages}
              />
            </Collapsible>
            <Button
              title="Create"
              onPress={createType == "account" ? addAccount : addFolder}
            />
          </View>
        </View>
      </View>
    );
  }

  // Displays selected Account information
  function renderDisplay() {
    if (!display) {
      return;
    }
    return (
      <View style={styles.account_content_box}>
        {display ? (
          <View
            style={[
              styles.account_content,
              {
                alignItems: width > 900 ? "stretch" : undefined,
                height: width < 900 ? height - headerHeight - 100 : undefined,
                marginLeft: width < 900 ? 38 : undefined,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.account_details,
                {
                  position: width < 900 ? "absolute" : "relative",
                  left: detailSlideAnim,
                },
              ]}
            >
              <Text
                style={[
                  styles.account_details_header,
                  { fontSize: width < 1000 ? 22 : 30 },
                ]}
              >
                {isAccount(display) ? "Account Details" : "Folder Details"}
              </Text>

              <Text
                style={[
                  styles.details_name,
                  { fontSize: width < 1000 ? 16 : 22 },
                ]}
              >
                {isAccount(display) ? "Account Name" : "Folder Name"}:{" "}
                {display.name}
              </Text>
              {isAccount(display) ? (
                <Text
                  style={[
                    styles.details_username,
                    { fontSize: width < 1000 ? 16 : 22 },
                  ]}
                >
                  Username: {display.username}
                </Text>
              ) : null}

              <Text
                style={[
                  styles.details_created,
                  { fontSize: width < 1000 ? 16 : 22 },
                ]}
              >
                Created:
                {" " +
                  formatDistanceToNowStrict(new Date(display.created + "Z"), {
                    addSuffix: true,
                  })}
              </Text>

              <View style={styles.delete_account}>
                <Button title="Delete" onPress={deleteAlert} />
              </View>
            </Animated.View>
            <View style={styles.account_info}>
              <View
                style={[
                  styles.display_account,
                  { width: width < 900 ? "90%" : "60%" },
                ]}
              >
                <View style={styles.display_box}>
                  <Text
                    style={[
                      styles.display_label,
                      { fontSize: width < 1200 ? 27 : 37 },
                    ]}
                  >
                    {isAccount(display) ? "Account Name" : "Folder Name"}
                  </Text>
                  <TextInput
                    value={isAccount(display) ? newAccount : newFolderName}
                    style={[
                      styles.display_name,
                      { fontSize: width < 1200 ? 22 : 32 },
                    ]}
                    onChangeText={
                      isAccount(display) ? setNewAccount : setNewFolderName
                    }
                  />
                </View>
                {isAccount(display) ? (
                  <>
                    <View style={styles.display_box}>
                      <Text
                        style={[
                          styles.display_label,
                          { fontSize: width < 1200 ? 27 : 37 },
                        ]}
                      >
                        Username
                      </Text>
                      <TextInput
                        value={newUsername}
                        style={[
                          styles.display_username,
                          { fontSize: width < 1200 ? 22 : 32 },
                        ]}
                        onChangeText={setNewUsername}
                      />
                    </View>
                    <View style={styles.display_box}>
                      <Text
                        style={[
                          styles.display_label,
                          { fontSize: width < 1200 ? 27 : 37 },
                        ]}
                      >
                        Password
                      </Text>
                      <TextInput
                        value={newPass}
                        style={[
                          styles.display_password,
                          { fontSize: width < 1200 ? 22 : 32 },
                        ]}
                        onChangeText={setNewPass}
                        secureTextEntry={!showPassword}
                        textContentType={"password"}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowPassword(showPassword ? false : true)
                        }
                        style={styles.show_password_icon}
                      >
                        <MaterialIcons
                          name={showPassword ? "visibility" : "visibility-off"}
                          size={24}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : null}
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

                <Button
                  title="Save Changes"
                  onPress={isAccount(display) ? updateAccount : updateFolder}
                ></Button>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView>
      <View
        style={{
          minHeight:
            Platform.OS === "android"
              ? height - headerHeight
              : height - headerHeight - tabBarHeight,
        }}
      >
        <View style={[styles.home_container]}>
          <Animated.View
            style={[
              styles.passwords_container,
              {
                maxWidth: width < 900 ? 300 : 400,
                width: width < 900 ? "100%" : undefined,
                position: width < 900 ? "absolute" : "relative",
                margin: width < 900 ? "auto" : undefined,
                left: passSlideAnim,
              },
            ]}
          >
            <View style={styles.passwords_box}>
              <Passwords
                objClickedCallBack={objClicked}
                displayCreateCallBack={displayCreate}
                newPass={created}
              />
            </View>
            <View
              style={[
                styles.create_account_button,
                { right: Platform.OS === "web" && width < 900 ? 40 : 0 },
              ]}
            >
              <Button
                onPress={() => displayCreate("account")}
                title="Add account"
              ></Button>
            </View>
            <View
              style={[
                styles.passwords_side_bar,
                {
                  display: width < 900 ? "flex" : "none",
                },
              ]}
            >
              {showPassMenu == false ? (
                <FontAwesome5
                  style={styles.password_menu_icon}
                  name="key"
                  size={24}
                  color="black"
                  onPress={togglePassMenu}
                />
              ) : (
                <FontAwesome6
                  style={styles.password_menu_icon}
                  name="xmark"
                  size={30}
                  color="black"
                  onPress={togglePassMenu}
                />
              )}
              {display && !createMenu ? (
                <MaterialIcons
                  style={{ marginTop: 20 }}
                  name="read-more"
                  size={30}
                  color="black"
                  onPress={toggleAccountDetail}
                />
              ) : null}
            </View>
          </Animated.View>
          <View style={styles.home_content}>
            {createMenu ? renderCreate() : renderDisplay()}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  home_container: {
    display: "flex",
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    flexGrow: 1,
  },

  passwords_container: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
    bottom: 0,
    top: 0,
    zIndex: 1,
    alignContent: "stretch",
    position: "relative",
  },
  passwords_box: {
    flexGrow: 1,
    paddingBottom: 70,
    backgroundColor: "white",
  },
  create_account_button: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignSelf: "center",
  },
  passwords_side_bar: {
    width: 40,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  password_menu_icon: {
    alignSelf: "center",
    height: 25,
    marginTop: 12,
  },
  home_content: {
    flexGrow: 1,
    borderLeftWidth: 1,
    borderLeftColor: "black",
  },

  account_content_box: {
    flexGrow: 1,
  },
  account_content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "row",
  },
  account_details: {
    backgroundColor: "#282C33",
    minWidth: 200,
    maxWidth: 400,
    zIndex: 2,
    top: 0,
    bottom: 0,
    flex: 1,
    paddingHorizontal: 20,
  },
  account_details_header: {
    fontSize: 22,
    textAlign: "center",
    marginTop: 20,
    color: "white",
  },
  details_name: {
    textAlign: "center",
    marginTop: 50,
    color: "white",
  },
  details_username: {
    textAlign: "center",
    marginTop: 50,
    color: "white",
  },
  details_created: {
    textAlign: "center",
    marginTop: 50,
    color: "white",
  },
  delete_account: {
    marginTop: "auto",
    width: "100%",
    marginBottom: 20,
  },
  account_info: {
    flexGrow: 1,
    display: "flex",
    marginHorizontal: "auto",
  },
  display_account: {
    alignSelf: "flex-start",
    margin: "auto",
  },
  display_box: {
    marginVertical: 20,
    borderBottomWidth: 1,
  },
  display_label: {},
  display_name: {
    maxHeight: 50,
    padding: 2,
  },
  display_username: {
    maxHeight: 50,
    padding: 2,
  },
  display_password: {
    maxHeight: 50,
    padding: 2,
  },
  show_password_icon: {
    position: "absolute",
    bottom: 5,
    right: 5,
  },
});
