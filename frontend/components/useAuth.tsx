import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import CryptoJS from "crypto-js";
import config from "@/config";
type UserContextType = {
  user: string | null;
  token: string | null;
  registerUser: (
    username: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<{ success: string; failure: string }>;
  loginUser: (username: string, password: string) => Promise<string>;
  logoutUser: () => void;
  loading: boolean;
  authenticated: boolean | null;
  decryptPassword: (password: string) => string;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: Props) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [decryptionKey, setDecryptionKey] = useState<string | null>(null);

  useEffect(() => {
    async function checkForUser() {
      const user = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("authToken");
      const key = await AsyncStorage.getItem("key");
      if (!user || !token || !key) {
        logoutUser();
        setIsLoading(false);
      } else {
        setUser(user);
        setToken(token);
        setDecryptionKey(key);
        checkToken(token);
        setIsLoading(false);
      }
    }
    checkForUser();

    const authInterval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => {
      clearInterval(authInterval);
    };
  }, []);

  const checkAuth = async () => {
    const authToken = await AsyncStorage.getItem("authToken");
    if (!authToken) {
      return;
    }
    checkToken(authToken);
  };

  const checkToken = async (token: string) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/check_token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAuthenticated(true);
    } catch (error) {
      logoutUser();
    }
  };

  const registerUser = async (
    username: string,
    email: string,
    password: string,
    passwordConfirm: string
  ): Promise<{ success: string; failure: string }> => {
    if (!username || !email || !password || !passwordConfirm) {
      return {
        success: "",
        failure: "All fields are required",
      };
    }
    try {
      const response = await axios.post(`${config.API_URL}/api/register`, {
        username,
        email,
        password,
        passwordConfirm,
      });

      return {
        success:
          "Your account have been created. Continue to login page to sign in.",
        failure: "",
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.msg ?? "Something Failed";
        return {
          success: "",
          failure: errorMessage,
        };
      } else if (error instanceof Error) {
        const errorMessage = error.message;
        console.error(errorMessage);
      }
    }
    return {
      success: "",
      failure: "",
    };
  };

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${config.API_URL}/api/login`, {
        username,
        password,
      });

      await AsyncStorage.setItem("authToken", response.data.access_token);
      await AsyncStorage.setItem("user", response.data.user);
      await AsyncStorage.setItem("key", response.data.decryption_key);
      setUser(response.data.user);
      setToken(response.data.access_token);
      setDecryptionKey(response.data.decryption_key);
      setAuthenticated(true);
      return response.data.message;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.msg ?? "Something Failed";
        return errorMessage;
      } else if (error instanceof Error) {
        const errorMessage = error.message;
        console.error(errorMessage);
      }
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("key");
    setToken(null);
    setUser(null);
    setDecryptionKey(null);
    setAuthenticated(false);
  };

  const decryptPassword = (password: string) => {
    if (!decryptionKey) {
      return password;
    }
    const keyHex = decryptionKey.match(/.{1,2}/g);
    if (!keyHex) {
      return password;
    }

    var encrypted = CryptoJS.enc.Base64.parse(decodeURIComponent(password));
    var key = CryptoJS.enc.Hex.parse(decryptionKey);
    var iv = CryptoJS.enc.Hex.parse(
      CryptoJS.enc.Hex.stringify(encrypted).substring(0, 32)
    );
    var ciphertext = CryptoJS.enc.Hex.parse(
      CryptoJS.enc.Hex.stringify(encrypted).substring(32)
    );
    console.log(key);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
      iv: iv,
    });

    var plaintext = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
    });

    return plaintext.toString(CryptoJS.enc.Utf8);
  };

  return (
    <UserContext.Provider
      value={{
        token,
        user,
        loginUser,
        registerUser,
        logoutUser,
        authenticated,
        loading,
        decryptPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useAuth = () => React.useContext(UserContext);
