// screens/ListKanvasingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Card, Text, FAB, Searchbar, ActivityIndicator } from "react-native-paper";
import { useNavigation, NavigationProp, useIsFocused } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getListKanvasi } from "../api/api";

const ListKanvasingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [kanvasings, setKanvasings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredKanvasings, setFilteredKanvasings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchKanvasingData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }
      const response = await getListKanvasi(token);
      setKanvasings(response.data.data);
      setFilteredKanvasings(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil daftar kanvasing:", error);
      Alert.alert("Kesalahan", "Gagal mengambil daftar kanvasing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchKanvasingData();
    }
  }, [isFocused]);

  const handleAddKanvasing = () => {
    navigation.navigate("FormPasangKanvasing");
  };

  const handleKanvasingDetail = (kanvasing: {
    id: number;
    foto: string;
    alamat: string;
  }) => {
    navigation.navigate("DetailKanvasing", { kanvasing });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = kanvasings.filter(kanvasing =>
        kanvasing.alamat.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredKanvasings(filtered);
    } else {
      setFilteredKanvasings(kanvasings);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKanvasingData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari Kanvasing"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredKanvasings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableHighlight
            underlayColor="#ddd"
            onPress={() => handleKanvasingDetail(item)}
          >
            <Card style={styles.card}>
              <Card.Cover source={{ uri: item.foto }} />
              <Card.Content>
                <Text style={styles.title}>{item.alamat}</Text>
              </Card.Content>
            </Card>
          </TouchableHighlight>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <FAB style={styles.fab} icon="plus" onPress={handleAddKanvasing} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default ListKanvasingScreen;
