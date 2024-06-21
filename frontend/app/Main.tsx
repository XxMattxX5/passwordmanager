import { View, ScrollView } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import App from "./index";
import Login from "./Login";
import Generator from "./Generator";
import Profile from "./Profile";
import Loading from "./Loading";
import Register from "./Register";
import TopBar from "@/components/TopBar";
import { useAuth, UserProvider } from "@/components/useAuth";

interface TabIconProps {
  icon: JSX.Element;
  color: string;
  name: string;
  focused: Boolean;
}

// Icon for tab bar
const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return <View>{icon}</View>;
};

const Tabs = createBottomTabNavigator();

export default function Main() {
  const { authenticated, loading } = useAuth();

  // Sends user to loading screen if they are still being authorized
  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        header: () => <TopBar />,
      }}
    >
      {authenticated ? (
        <>
          <Tabs.Screen
            name="index"
            component={App}
            options={{
              title: "Home",

              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={<Entypo name="home" size={24} color="black" />}
                  color={color}
                  name="Home"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="Generator"
            component={Generator}
            options={{
              title: "Password Generator",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={
                    <MaterialIcons name="password" size={24} color="black" />
                  }
                  color={color}
                  name="Generator"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="Profile"
            component={Profile}
            options={{
              title: "Profile",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={<MaterialIcons name="person" size={24} color="black" />}
                  color={color}
                  name="Profile"
                  focused={focused}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="Login"
            children={() => <Login />}
            options={{
              title: "Login",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={
                    <MaterialCommunityIcons
                      name="login"
                      size={24}
                      color="black"
                    />
                  }
                  color={color}
                  name="Login"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="Register"
            component={Register}
            options={{
              title: "Register",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={
                    <MaterialCommunityIcons
                      name="clipboard-edit"
                      size={24}
                      color="black"
                    />
                  }
                  color={color}
                  name="Profile"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="Generator"
            component={Generator}
            options={{
              title: "Generator",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={
                    <MaterialIcons name="password" size={24} color="black" />
                  }
                  color={color}
                  name="Generator"
                  focused={focused}
                />
              ),
            }}
          />
        </>
      )}
    </Tabs.Navigator>
  );
}
