// screens/ListAPKScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Card, Text, FAB, Searchbar } from "react-native-paper";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { NavigationProp } from "@react-navigation/native";
import { getListAPK } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ListAPKScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [apks, setApks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredApks, setFilteredApks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const fetchAPKData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      const response = await getListAPK(token);
      setApks(response.data.data);
      setFilteredApks(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil daftar APK:", error);
      Alert.alert("Kesalahan", "Gagal mengambil daftar APK");
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAPKData();
    }
  }, [isFocused]);

  const handleAddAPK = () => {
    navigation.navigate("FormPasangAPK");
  };

  const handleAPKDetail = (apk: {
    id: number;
    foto: string;
    jenis: string;
    alamat: string;
  }) => {
    navigation.navigate("DetailAPK", { apk });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = apks.filter(apk =>
        apk.jenis.toLowerCase().includes(query.toLowerCase()) ||
        apk.alamat.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredApks(filtered);
    } else {
      setFilteredApks(apks);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAPKData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari APK"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredApks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableHighlight
            underlayColor="#ddd"
            onPress={() => handleAPKDetail(item)}
          >
            <Card style={styles.card}>
              <Card.Cover source={{ uri: item.foto }} />
              <Card.Content>
                <Text style={styles.title}>{item.jenis}</Text>
                <Text>{item.alamat}</Text>
              </Card.Content>
            </Card>
          </TouchableHighlight>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <FAB style={styles.fab} icon="plus" onPress={handleAddAPK} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  searchbar: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#ee8b60",
  },
});

export default ListAPKScreen;
