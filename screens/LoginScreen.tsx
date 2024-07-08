// screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TextInput, Button, Card, Text } from "react-native-paper";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import logo from "../assets/bangabah.png";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../api/api";
import { RootStackParamList } from "../types/navigation";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { setToken, setUsername } = useAuth();
  const [username, setUsernameInput] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const buttonOpacity = React.useRef(new Animated.Value(1)).current;

  const validateUsername = (username: string): boolean => {
    if (!username) {
      setUsernameError("Username is required");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const animateButton = () => {
    Animated.timing(buttonOpacity, {
      toValue: 0.5,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => buttonOpacity.setValue(1));
  };

  const handleLogin = async () => {
    const usernameIsValid = validateUsername(username);
    const passwordIsValid = validatePassword(password);

    if (usernameIsValid && passwordIsValid) {
      setLoading(true);

      try {
        const response = await login(username, password);
        console.log("User logged in", response.data);

        await AsyncStorage.setItem("accessToken", response.data.access_token);
        await AsyncStorage.setItem("username", response.data.data.user.name);

        setToken(response.data.access_token);
        setUsername(response.data.data.user.name);

        navigation.navigate("Beranda");
      } catch (error: any) {
        console.error("Login failed:", error.response ? error.response.data : error);
        Alert.alert(
          "Login failed",
          error.response && error.response.data
            ? error.response.data.message
            : error.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Image source={logo} style={styles.logo} />
          <TextInput
            label="Username"
            value={username}
            onChangeText={(text) => setUsernameInput(text)}
            onBlur={() => validateUsername(username)}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            error={!!usernameError}
          />
          {usernameError ? (
            <Text style={styles.errorText}>{usernameError}</Text>
          ) : null}
          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            onBlur={() => validatePassword(password)}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            error={!!passwordError}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
          <Animated.View style={{ opacity: buttonOpacity }}>
            <Button
              mode="contained"
              onPress={() => {
                animateButton();
                handleLogin();
              }}
              style={styles.button}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : "Login"}
            </Button>
          </Animated.View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ee8b60",
    padding: 16,
  },
  card: {
    padding: 12,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 200,
    height: 150,
    alignSelf: "center",
  },
  input: {
    marginBottom: 16,
    color: "#ee8b60",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#ee8b60",
  },
});

export default LoginScreen;
