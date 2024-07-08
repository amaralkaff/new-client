// screens/DetailKanvasingScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDetailKanvasi, deleteKanvasi } from "../api/api";

type DetailKanvasingScreenProps = StackScreenProps<
  RootStackParamList,
  "DetailKanvasing"
>;

const DetailKanvasingScreen: React.FC<DetailKanvasingScreenProps> = ({
  route,
  navigation,
}) => {
  const { kanvasing } = route.params;
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const response = await getDetailKanvasi(token, kanvasing.id);
          setDetails(response.data.data);
        } else {
          setError("Token tidak ditemukan");
        }
      } catch (err: any) {
        setError(err.message);
        if (err.response && err.response.status === 401) {
          Alert.alert("Kesalahan", "Sesi berakhir. Silakan login lagi.", [
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

    fetchDetails();
  }, [kanvasing.id, navigation]);

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        await deleteKanvasi(token, kanvasing.id);
        Alert.alert("Berhasil", "Kanvasi berhasil dihapus");
        navigation.navigate("ListKanvasi", { refresh: true });
      } else {
        setError("Token tidak ditemukan");
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Kesalahan", err.message);
    }
  };

  const openImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => openImageModal(details.foto)}>
          <Card.Cover source={{ uri: details.foto }} style={styles.image} />
        </TouchableOpacity>
        <Card.Content>
          <Text style={styles.title}>Alamat: {details.alamat}</Text>
          <Text style={styles.location}>Kecamatan: {details.kecamatan}</Text>
          <Text style={styles.location}>Kabupaten: {details.kabupaten}</Text>
          <Text style={styles.location}>Latitude: {details.latitude}</Text>
          <Text style={styles.location}>Longitude: {details.longitude}</Text>
          <TouchableOpacity onPress={() => openImageModal(details.ktp)}>
            <Image source={{ uri: details.ktp }} style={styles.smallImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openImageModal(details.kuitansi)}>
            <Image source={{ uri: details.kuitansi }} style={styles.smallImage} />
          </TouchableOpacity>
          <Button
            mode="contained"
            onPress={handleDelete}
            style={styles.deleteButton}
          >
            Hapus Kanvasi
          </Button>
        </Card.Content>
      </Card>
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: "#fff",
  },
  image: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 300,
  },
  smallImage: {
    height: 100,
    width: 100,
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  location: {
    fontSize: 18,
    color: "#666",
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
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
});

export default DetailKanvasingScreen;
