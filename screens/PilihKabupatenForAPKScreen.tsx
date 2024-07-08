// screens/PilihKabupatenForAPKScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableHighlight,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { getListKabupaten } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type PilihKabupatenForAPKScreenProps = StackScreenProps<
  RootStackParamList,
  "PilihKabupatenForAPK"
>;

const PilihKabupatenForAPKScreen: React.FC<PilihKabupatenForAPKScreenProps> = ({
  navigation,
  route,
}) => {
  const [kabupatens, setKabupatens] = useState<
    { id: string; kabupaten: string }[]
  >([]);
  const [filteredKabupatens, setFilteredKabupatens] = useState<
    { id: string; kabupaten: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKabupatens = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found");
        }
        const response = await getListKabupaten(token);
        setKabupatens(response.data.data);
        setFilteredKabupatens(response.data.data);
      } catch (error: any) {
        console.error("Failed to fetch kabupatens", error.message);
        setError(error.message);
        if (error.response && error.response.status === 401) {
          Alert.alert("Error", "Session expired. Please login again.", [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchKabupatens();
  }, [navigation]);

  useEffect(() => {
    const filtered = kabupatens.filter((kabupaten) =>
      kabupaten.kabupaten.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredKabupatens(filtered);
  }, [searchQuery, kabupatens]);

  const handleSelectKabupaten = (selectedKabupaten: {
    id: string;
    kabupaten: string;
  }) => {
    route.params?.onGoBack?.({
      id: selectedKabupaten.id,
      name: selectedKabupaten.kabupaten,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Kabupaten"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredKabupatens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor="#ddd"
              onPress={() => handleSelectKabupaten(item)}
            >
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.kabupaten}</Text>
              </View>
            </TouchableHighlight>
          )}
          ListEmptyComponent={<Text>Tidak ada data</Text>}
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "#f9f9f9",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
});

export default PilihKabupatenForAPKScreen;