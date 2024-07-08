// AuthInitializer.tsx
import React, { useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

interface AuthInitializerProps {
  children: ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { setToken, setUsername } = useAuth();

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      const storedUsername = await AsyncStorage.getItem("username");

      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    loadAuthData();
  }, [setToken, setUsername]);

  return <>{children}</>;
};

export default AuthInitializer;
