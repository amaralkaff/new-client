// screens/BerandaScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Alert, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { Text, Button, Card } from "react-native-paper";

type BerandaScreenProps = StackScreenProps<RootStackParamList, "Beranda">;

const BerandaScreen: React.FC<BerandaScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        console.log("Username fetched:", storedUsername);

        if (storedUsername !== null) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Gagal mengambil username dari penyimpanan", error);
      }
    };

    loadUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("accessToken");
      Alert.alert(
        "Keluar",
        "Anda telah berhasil keluar",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Kesalahan saat keluar", error);
    }
  };

  const navigateToPasangAPK = () => {
    navigation.navigate("ListAPK");
  };

  const navigateToKanvasing = () => {
    navigation.navigate("Kanvasing");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.email}>
          Anda login sebagai <Text style={styles.bold}>{username}</Text>
        </Text>
      </View>
      <Card style={styles.bannerCard}>
        <Card.Content style={styles.photoContent}>
          <Image
            source={require("../assets/BangZulBanner.png")}
            style={styles.photo}
          />
        </Card.Content>
      </Card>
      <Text style={styles.header}>Bang Zul-Abah Uhel</Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={navigateToPasangAPK}
          style={styles.button}
        >
          Pasang APK
        </Button>
        <Button
          mode="contained"
          onPress={navigateToKanvasing}
          style={styles.button}
        >
          Kanvasing
        </Button>
      </View>
      <View style={styles.signOutButtonContainer}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          Logout
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  topContainer: {
    alignItems: "center",
  },
  email: {
    fontSize: 16,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  bannerCard: {
    marginBottom: 20,
  },
  photoContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#ee8b60",
  },
  signOutButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  signOutButton: {
    borderColor: "#000",
    borderWidth: 1,
    width: "100%",
  },
});

export default BerandaScreen;
