// screens/PilihKecamatanForKanvasingScreen.tsx
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
import { getListKecamatan } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type PilihKecamatanForKanvasingScreenProps = StackScreenProps<
  RootStackParamList,
  "PilihKecamatanForKanvasing"
>;

const PilihKecamatanForKanvasingScreen: React.FC<
  PilihKecamatanForKanvasingScreenProps
> = ({ navigation, route }) => {
  const { kabupaten } = route.params;
  const [kecamatans, setKecamatans] = useState<
    { id: string; kecamatan: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKecamatans = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found");
        }
        const response = await getListKecamatan(token, kabupaten.id);
        const filteredKecamatans = response.data.data.filter(
          (kecamatan: { id: string; kecamatan: string }) =>
            kecamatan.kecamatan
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setKecamatans(filteredKecamatans);
      } catch (error: any) {
        console.error("Failed to fetch kecamatans", error.message);
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
    fetchKecamatans();
  }, [searchQuery, kabupaten.id, navigation]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder={`Search Kecamatan in ${kabupaten.name}`}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={kecamatans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor="#ddd"
              onPress={() =>
                navigation.navigate("FormPasangKanvasing", {
                  kecamatan: item.kecamatan,
                })
              }
            >
              <View style={styles.item}>
                <Text>{item.kecamatan}</Text>
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
});

export default PilihKecamatanForKanvasingScreen;
