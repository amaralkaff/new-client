// screens/PilihKabupatenForKanvasingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { getListKabupaten } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type PilihKabupatenForKanvasingScreenProps = StackScreenProps<
  RootStackParamList,
  "PilihKabupatenForKanvasing"
>;

const PilihKabupatenForKanvasingScreen: React.FC<
  PilihKabupatenForKanvasingScreenProps
> = ({ navigation }) => {
  const [kabupatens, setKabupatens] = useState<
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
        const filteredKabupatens = response.data.data.filter(
          (kabupaten: { id: string; kabupaten: string }) =>
            kabupaten.kabupaten
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setKabupatens(filteredKabupatens);
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
  }, [searchQuery, navigation]);

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
          data={kabupatens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor="#ddd"
              onPress={() =>
                navigation.navigate("FormPasangKanvasing", {
                  kabupaten: { id: item.id, name: item.kabupaten },
                })
              }
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

export default PilihKabupatenForKanvasingScreen;
