import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { List } from "react-native-paper";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/components/useAuth";
import config from "@/config";

type SortOption = {
  label: string;
  value: string;
};
interface passwordsProps {
  objClickedCallBack: (obj: Account | Folder | null) => void;
  displayCreateCallBack?: (type: string) => void;
  newPass: number;
}

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

export default function passwords({
  objClickedCallBack,
  displayCreateCallBack,
  newPass,
}: passwordsProps) {
  const { token, logoutUser } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [view, setView] = useState("all");
  const sortOps = [
    { label: "Name", value: "name" },
    { label: "Created", value: "created_at" },
  ];
  const viewOps = [
    { label: "All", value: "all" },
    { label: "Folders", value: "folders" },
    { label: "Accounts", value: "accounts" },
  ];
  const [folders, setFolders] = useState<Array<Folder>>([]);
  const [accounts, setAccounts] = useState<Array<Account>>([]);

  useEffect(() => {
    getPasswords();
  }, [newPass]);

  async function getPasswords() {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/password_list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFolders(response.data.folders);
      setAccounts(response.data.passwords);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 401) {
          logoutUser();
          return;
        }
        const errorMessage = error.response?.data?.msg ?? "Something Failed";
        console.error(errorMessage);
      } else if (error instanceof Error) {
        const errorMessage = error.message;
        console.error(errorMessage);
      }
    }
  }

  function updateSearch(searchText: string) {
    setSearch(searchText);
  }
  function updateSort(sortOption: SortOption) {
    let newFolders;
    let newAccounts;
    setSort(sortOption.value);
    if (!folders && !accounts) {
      return;
    }
    if (sortOption.value == "name" && folders) {
      newFolders = folders.sort((a, b) => (a.name > b.name ? 1 : -1));
      setFolders(newFolders);
    } else if (sortOption.value == "created_at" && folders) {
      newFolders = folders.sort((a, b) =>
        new Date(a.created).getTime() < new Date(b.created).getTime() ? 1 : -1
      );
      setFolders(newFolders);
    }
    if (sortOption.value == "name" && accounts) {
      newAccounts = accounts.sort((a, b) => (a.name > b.name ? 1 : -1));
      setAccounts(newAccounts);
    } else if (sortOption.value == "created_at" && accounts) {
      newAccounts = accounts.sort((a, b) =>
        new Date(a.created).getTime() < new Date(b.created).getTime() ? 1 : -1
      );
      setAccounts(newAccounts);
    }
  }
  function updateView(viewOption: SortOption) {
    setView(viewOption.value);
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => objClickedCallBack(null)}
    >
      <View style={styles.content_container}>
        <View style={styles.passwords_header}>
          <TextInput
            placeholder="Search passwords and folders..."
            placeholderTextColor="#919191"
            onChangeText={updateSearch}
            value={search}
            style={styles.passwords_search_input_container}
          />
          <View>
            <View style={styles.header_box}>
              <View style={styles.header_sort_box}>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  data={sortOps}
                  value={sort}
                  style={styles.header_sort_dropdown}
                  selectedTextStyle={styles.header_sort_input}
                  placeholderStyle={styles.header_sort_input}
                  itemTextStyle={styles.header_sort_input}
                  onChange={updateSort}
                  placeholder="Sort By"
                />
              </View>
              <View style={styles.header_type_box}>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  data={viewOps}
                  value={view}
                  style={styles.header_sort_dropdown}
                  selectedTextStyle={styles.header_sort_input}
                  itemTextStyle={styles.header_sort_input}
                  onChange={updateView}
                />
              </View>
              <AntDesign
                style={styles.new_folder_icon}
                name="addfolder"
                size={24}
                color="black"
                onPress={() =>
                  displayCreateCallBack ? displayCreateCallBack("folder") : null
                }
              />
            </View>
          </View>
        </View>
        <View style={styles.accounts_folders_box}>
          <List.Section>
            {view == "all" || view == "folders"
              ? folders.map((folder) =>
                  folder.name.toLowerCase().includes(search.toLowerCase()) ? (
                    <List.Accordion
                      key={folder.id}
                      style={styles.folders}
                      title={folder.name}
                      left={(props) => <List.Icon {...props} icon="folder" />}
                      onPress={() => objClickedCallBack(folder)}
                      theme={{
                        colors: {
                          primary: undefined,
                        },
                      }}
                    >
                      {folder.accounts.map((account) => (
                        <Pressable
                          key={account.id}
                          onPress={() => objClickedCallBack(account)}
                        >
                          <View>
                            <Text style={{ fontSize: 17, marginVertical: 10 }}>
                              {account.name}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </List.Accordion>
                  ) : null
                )
              : null}
          </List.Section>
          {view == "all" || view == "accounts"
            ? accounts.map((account) =>
                !search ||
                account.name.toLowerCase().includes(search.toLowerCase()) ? (
                  <Pressable
                    key={account.id}
                    onPress={() => objClickedCallBack(account)}
                  >
                    <View>
                      <Text style={styles.folder_text}>{account.name}</Text>
                    </View>
                  </Pressable>
                ) : null
              )
            : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    cursor: "auto",
  },
  content_container: {
    width: "95%",
    marginHorizontal: "auto",
  },
  passwords_header: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },

  passwords_search_input_container: {
    height: 30,
    zIndex: 2,
    marginTop: 10,
    fontSize: 16,
    paddingLeft: 5,
    borderWidth: 0.5,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.84,
  },
  header_box: {
    marginTop: 0,
    display: "flex",
    flexDirection: "row",
  },
  header_sort_box: {
    flex: 1,
  },
  header_sort_dropdown: {
    paddingLeft: 5,
    width: 100,
    backgroundColor: "white",
    fontSize: 12,
  },
  header_sort_input: {
    fontSize: 12,
  },
  header_type_box: {},
  new_folder_icon: {
    alignSelf: "center",
    marginLeft: 15,
  },
  folder_box: {
    display: "flex",
    flexDirection: "row",
    borderColor: "black",
    borderWidth: 1,
    paddingHorizontal: 5,
    marginTop: 5,
  },
  folders: { paddingBottom: 0, paddingTop: 0 },

  folder_text: {
    fontSize: 20,
  },
  folder_arrow_box: {
    marginLeft: "auto",
    alignSelf: "center",
  },
  folder_arrow: {
    alignContent: "center",
  },
  accounts_folders_box: {
    marginTop: 10,
  },
});
