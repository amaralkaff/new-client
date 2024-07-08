// screens/PilihKecamatanForAPKScreen.tsx
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

type PilihKecamatanForAPKScreenProps = StackScreenProps<
  RootStackParamList,
  "PilihKecamatanForAPK"
>;

const PilihKecamatanForAPKScreen: React.FC<PilihKecamatanForAPKScreenProps> = ({
  navigation,
  route,
}) => {
  const { kabupaten } = route.params;
  const [kecamatans, setKecamatans] = useState<
    { id: string; kecamatan: string }[]
  >([]);
  const [filteredKecamatans, setFilteredKecamatans] = useState<
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
        setKecamatans(response.data.data);
        setFilteredKecamatans(response.data.data);
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
  }, [navigation, kabupaten.id]);

  useEffect(() => {
    const filtered = kecamatans.filter((kecamatan) =>
      kecamatan.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredKecamatans(filtered);
  }, [searchQuery, kecamatans]);

  const handleSelectKecamatan = (selectedKecamatan: {
    id: string;
    kecamatan: string;
  }) => {
    route.params?.onGoBack?.(selectedKecamatan.kecamatan);
    navigation.goBack();
  };

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
          data={filteredKecamatans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor="#ddd"
              onPress={() => handleSelectKecamatan(item)}
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

export default PilihKecamatanForAPKScreen;
