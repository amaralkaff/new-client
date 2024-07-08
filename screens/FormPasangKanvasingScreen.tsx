// screens/FormPasangKanvasingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text as RNText,
} from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { uploadKanvasi } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

type FormPasangKanvasingScreenProps = StackScreenProps<
  RootStackParamList,
  "FormPasangKanvasing"
>;

const FormPasangKanvasingScreen: React.FC<FormPasangKanvasingScreenProps> = ({
  navigation,
  route,
}) => {
  const [formData, setFormData] = useState({
    kabupaten: { id: "", name: "" },
    kecamatan: "",
    location: { latitude: 0, longitude: 0 },
    fotoOrangRumah: null as string | null,
    fotoKTP: null as string | null,
    fotoKuitansi: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [responseString, setResponseString] = useState("");
  const [errors, setErrors] = useState({
    kabupaten: false,
    kecamatan: false,
    location: false,
    fotoOrangRumah: false,
    fotoKTP: false,
    fotoKuitansi: false,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin akses lokasi ditolak");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setFormData((prevData) => ({
        ...prevData,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      }));
      setLoading(false);
    };

    fetchLocation();

    if (route.params?.kabupaten) {
      setFormData((prevData) => ({
        ...prevData,
        kabupaten: route.params.kabupaten,
      }));
    }
    if (route.params?.kecamatan) {
      setFormData((prevData) => ({
        ...prevData,
        kecamatan: route.params.kecamatan,
      }));
    }
    if (route.params?.selectedLocation) {
      setFormData((prevData) => ({
        ...prevData,
        location: route.params.selectedLocation,
      }));
    }
  }, [route.params]);

  const pickImage = async (imageType: string) => {
    let result: ImagePicker.ImagePickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

    if (!result.canceled && result.assets?.length) {
      const imageUri = result.assets[0].uri;
      setFormData((prevData) => ({
        ...prevData,
        [imageType]: imageUri,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [imageType]: false }));
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  const validateForm = () => {
    const newErrors = {
      kabupaten: !formData.kabupaten.name,
      kecamatan: !formData.kecamatan,
      location: !formData.location.latitude || !formData.location.longitude,
      fotoOrangRumah: !formData.fotoOrangRumah,
      fotoKTP: !formData.fotoKTP,
      fotoKuitansi: !formData.fotoKuitansi,
    };
    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      Alert.alert("Kesalahan", "Harap isi semua bidang yang diperlukan.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const form = new FormData();
      form.append("longitude", formData.location.longitude.toString() || "");
      form.append("latitude", formData.location.latitude.toString() || "");
      form.append("alamat", `${formData.kecamatan || ""}, ${formData.kabupaten.name || ""}`);
      form.append("id_kecamatan", formData.kabupaten.id || "");

      if (formData.fotoOrangRumah) {
        form.append("foto", {
          uri: formData.fotoOrangRumah,
          name: "foto_orang_rumah.jpg",
          type: "image/jpeg",
        } as any);
      }
      if (formData.fotoKTP) {
        form.append("ktp", {
          uri: formData.fotoKTP,
          name: "foto_ktp.jpg",
          type: "image/jpeg",
        } as any);
      }
      if (formData.fotoKuitansi) {
        form.append("kuitansi", {
          uri: formData.fotoKuitansi,
          name: "foto_kuitansi.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await uploadKanvasi(token, form);
      console.log("Upload sukses:", response.data);

      const curlCommand = `
curl -X 'POST' \\
  'http://192.168.1.31:8000/api/v1/upload_kanvasi' \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'longitude=${formData.location.longitude}' \\
  -F 'latitude=${formData.location.latitude}' \\
  -F 'alamat=${formData.kecamatan || ""}, ${formData.kabupaten.name || ""}' \\
  -F 'id_kecamatan=${formData.kabupaten.id || ""}' \\
  ${
    formData.fotoOrangRumah
      ? `-F 'foto=@${formData.fotoOrangRumah};type=image/jpeg'`
      : ""
  } \\
  ${formData.fotoKTP ? `-F 'ktp=@${formData.fotoKTP};type=image/jpeg'` : ""} \\
  ${
    formData.fotoKuitansi
      ? `-F 'kuitansi=@${formData.fotoKuitansi};type=image/jpeg'`
      : ""
  }
`;
      setResponseString(curlCommand);

      navigation.navigate("ListKanvasi", { refresh: true });
    } catch (error: any) {
      console.error("Gagal mengupload:", error);
      Alert.alert("Gagal mengupload", "Silakan coba lagi.");
    }
  };

  const renderLocationText = () => {
    const { kecamatan, kabupaten, location } = formData;
    if (
      kecamatan &&
      kabupaten.name &&
      location.latitude &&
      location.longitude
    ) {
      return `${kecamatan}, ${kabupaten.name}, Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
    }
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Kanvasing</Text>
      <TouchableOpacity
        onPress={() => pickImage("fotoOrangRumah")}
        style={styles.imagePicker}
      >
        {formData.fotoOrangRumah ? (
          <Image
            source={{ uri: formData.fotoOrangRumah }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Pilih Foto Orang dan Rumah</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.fotoOrangRumah && <Text style={styles.error}>Foto Orang dan Rumah diperlukan</Text>}
      <TouchableOpacity
        onPress={() => pickImage("fotoKTP")}
        style={styles.imagePicker}
      >
        {formData.fotoKTP ? (
          <Image source={{ uri: formData.fotoKTP }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Pilih Foto KTP</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.fotoKTP && <Text style={styles.error}>Foto KTP diperlukan</Text>}
      <TouchableOpacity
        onPress={() => pickImage("fotoKuitansi")}
        style={styles.imagePicker}
      >
        {formData.fotoKuitansi ? (
          <Image source={{ uri: formData.fotoKuitansi }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Pilih Foto Kuitansi</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.fotoKuitansi && <Text style={styles.error}>Foto Kuitansi diperlukan</Text>}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kabupaten</Text>
        <TextInput
          placeholder="Kabupaten"
          value={formData.kabupaten.name}
          onFocus={() => navigation.navigate("PilihKabupatenForKanvasing")}
          style={styles.input}
        />
        {errors.kabupaten && <Text style={styles.error}>Kabupaten diperlukan</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kecamatan</Text>
        <TextInput
          placeholder="Kecamatan"
          value={formData.kecamatan}
          onFocus={() => {
            if (formData.kabupaten.id) {
              navigation.navigate("PilihKecamatanForKanvasing", {
                kabupaten: formData.kabupaten,
              });
            } else {
              Alert.alert("Kesalahan", "Pilih Kabupaten terlebih dahulu.");
            }
          }}
          style={styles.input}
        />
        {errors.kecamatan && <Text style={styles.error}>Kecamatan diperlukan</Text>}
      </View>
      <View style={styles.mapContainer}>
        <Text style={styles.label}>Lokasi</Text>
        <MapView
          style={styles.map}
          region={{
            latitude: formData.location.latitude,
            longitude: formData.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={(e) => {
            const { coordinate } = e.nativeEvent;
            setFormData((prevData) => ({
              ...prevData,
              location: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
              },
            }));
            setErrors((prevErrors) => ({ ...prevErrors, location: false }));
          }}
        >
          <Marker coordinate={formData.location} />
        </MapView>
        <TouchableOpacity
          onPress={() => navigation.navigate("PilihLokasiForKanvasing")}
          style={styles.mapButton}
        >
          <Text style={styles.mapButtonText}>Pilih lokasi saat ini</Text>
        </TouchableOpacity>
        {errors.location && <Text style={styles.error}>Lokasi diperlukan</Text>}
        <Text>
          {renderLocationText()}
          {loading && <ActivityIndicator size="small" color="#000" />}
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={handleUpload}
        style={styles.uploadButton}
      >
        Upload
      </Button>
      {responseString ? (
        <View style={styles.responseContainer}>
          <RNText>{responseString}</RNText>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapButton: {
    backgroundColor: "#ee8b60",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  uploadButton: {
    marginTop: 20,
    backgroundColor: "#ee8b60",
  },
  responseContainer: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginTop: 5,
  },
});

export default FormPasangKanvasingScreen;
