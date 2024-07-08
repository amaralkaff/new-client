// screens/DetailAPKScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Text, Button, Card, Paragraph, Dialog, Portal, Provider } from "react-native-paper";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { getDetailAPK, deleteAPK } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DetailAPKScreenProps = StackScreenProps<RootStackParamList, "DetailAPK">;

const DetailAPKScreen: React.FC<DetailAPKScreenProps> = ({ route, navigation }) => {
  const { apk } = route.params;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const response = await getDetailAPK(token, apk.id);
          setDetail(response.data.data);
        } else {
          setError("Token tidak ditemukan");
        }
      } catch (err: any) {
        setError(err.message);
        if (err.response && err.response.status === 401) {
          Alert.alert("Kesalahan", "Sesi telah berakhir. Silakan login kembali.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [apk.id, navigation]);

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        await deleteAPK(token, apk.id);
        Alert.alert("Berhasil", "APK berhasil dihapus");
        navigation.navigate("ListAPK", { refresh: true });
      } else {
        setError("Token tidak ditemukan");
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Kesalahan", err.message);
    }
  };

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data detail tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <Provider>
      <View style={styles.container}>
        <Card style={styles.card}>
          <TouchableOpacity onPress={() => openImageModal(detail.foto)}>
            <Card.Cover source={{ uri: detail.foto }} style={styles.image} />
          </TouchableOpacity>
          <Card.Content>
            <Text style={styles.title}>{detail.jenis}</Text>
            <Paragraph style={styles.location}>
              Alamat: {detail.kecamatan}, {detail.kabupaten}
            </Paragraph>
            <Paragraph style={styles.location}>
              Latitude: {detail.latitude}, Longitude: {detail.longitude}
            </Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={showDialog} style={styles.deleteButton}>
              Hapus APK
            </Button>
          </Card.Actions>
        </Card>
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Konfirmasi</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Apakah Anda yakin ingin menghapus APK ini?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Batal</Button>
              <Button onPress={() => { hideDialog(); handleDelete(); }}>Hapus</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginVertical: 10,
  },
  image: {
    height: 300,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  location: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  deleteButton: {
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

export default DetailAPKScreen;
