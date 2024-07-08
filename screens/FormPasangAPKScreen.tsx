// screens/FormPasangAPKScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import { getJenisAPK, uploadAPK } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

type FormPasangAPKScreenProps = StackScreenProps<RootStackParamList, "FormPasangAPK">;

const FormPasangAPKScreen: React.FC<FormPasangAPKScreenProps> = ({ navigation, route }) => {
  const [jenisAPKOptions, setJenisAPKOptions] = useState<{ label: string; value: string }[]>([]);
  const [formData, setFormData] = useState({
    jenisAPK: "",
    kabupaten: { id: "", name: "" },
    kecamatan: "",
    location: { latitude: 0, longitude: 0 },
    image: null as string | null,
    filename: "",
    filetype: "",
  });
  const [loading, setLoading] = useState(true);
  const [responseString, setResponseString] = useState("");

  const [errors, setErrors] = useState({
    jenisAPK: false,
    kabupaten: false,
    kecamatan: false,
    location: false,
    image: false,
  });

  useEffect(() => {
    const fetchJenisAPK = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }
        const response = await getJenisAPK(token);
        const options = response.data.data.map((item: { id: string; jenis: string }) => ({
          label: item.jenis,
          value: item.id,
        }));
        setJenisAPKOptions(options);
      } catch (error) {
        console.error("Gagal mengambil jenis APK:", error);
      }
    };

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

    fetchJenisAPK();
    fetchLocation();
  }, []);

  useEffect(() => {
    if (route.params?.kabupaten) {
      setFormData((prevData) => ({
        ...prevData,
        kabupaten: route.params.kabupaten,
      }));
    }
  }, [route.params?.kabupaten]);

  useEffect(() => {
    if (route.params?.kecamatan) {
      setFormData((prevData) => ({
        ...prevData,
        kecamatan: route.params.kecamatan,
      }));
    }
  }, [route.params?.kecamatan]);

  useEffect(() => {
    if (route.params?.selectedLocation) {
      setFormData((prevData) => ({
        ...prevData,
        location: route.params.selectedLocation,
      }));
    }
  }, [route.params?.selectedLocation]);

  const pickImage = async () => {
    let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length) {
      const imageUri = result.assets[0].uri;
      let filename = imageUri.split("/").pop() || "";
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      setFormData((prevData) => ({
        ...prevData,
        image: imageUri,
        filename: filename,
        filetype: type,
      }));
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  const validateForm = () => {
    const newErrors = {
      jenisAPK: !formData.jenisAPK,
      kabupaten: !formData.kabupaten.name,
      kecamatan: !formData.kecamatan,
      location: !formData.location.latitude || !formData.location.longitude,
      image: !formData.image,
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
      form.append("id_jenis", formData.jenisAPK || "");
      form.append("id_kecamatan", formData.kabupaten.id || "");

      if (formData.image) {
        form.append("foto", {
          uri: formData.image,
          name: formData.filename,
          type: formData.filetype,
        } as any);
      }

      const response = await uploadAPK(token, form);
      console.log("Upload sukses:", response.data);

      const curlCommand = `
curl -X 'POST' \\
  'http://192.168.1.31:8000/api/v1/upload_apk' \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'longitude=${formData.location.longitude}' \\
  -F 'latitude=${formData.location.latitude}' \\
  -F 'alamat=${formData.kecamatan || ""}, ${formData.kabupaten.name || ""}' \\
  -F 'id_jenis=${formData.jenisAPK || ""}' \\
  -F 'id_kecamatan=${formData.kabupaten.id || ""}' \\
  ${
    formData.image
      ? `-F 'foto=@${formData.filename};type=${formData.filetype}'`
      : ""
  }
`;
      setResponseString(curlCommand);

      navigation.navigate("ListAPK", { refresh: true });
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
      return `\n
${kecamatan}, ${kabupaten.name}, Nusa Tenggara Barat\n
Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
    }
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Pasang APK</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {formData.image ? (
          <Image source={{ uri: formData.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Pilih gambar</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.image && <Text style={styles.error}>Gambar diperlukan</Text>}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Jenis APK</Text>
        <Dropdown
          data={jenisAPKOptions}
          labelField="label"
          valueField="value"
          placeholder="Pilih Jenis APK"
          value={formData.jenisAPK}
          onChange={(item) => handleInputChange("jenisAPK", item.value)}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
        />
        {errors.jenisAPK && <Text style={styles.error}>Jenis APK diperlukan</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kabupaten</Text>
        <TextInput
          placeholder="Kabupaten"
          value={formData.kabupaten.name}
          onFocus={() =>
            navigation.navigate("PilihKabupatenForAPK", {
              onGoBack: (selectedKabupaten: { id: string; name: string }) => {
                setFormData((prevData) => ({
                  ...prevData,
                  kabupaten: selectedKabupaten,
                  kecamatan: "",
                }));
                setErrors((prevErrors) => ({ ...prevErrors, kabupaten: false }));
              },
            })
          }
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
              navigation.navigate("PilihKecamatanForAPK", {
                kabupaten: formData.kabupaten,
                onGoBack: (selectedKecamatan: string) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    kecamatan: selectedKecamatan,
                  }));
                  setErrors((prevErrors) => ({ ...prevErrors, kecamatan: false }));
                },
              });
            } else {
              Alert.alert("Pilih Kabupaten terlebih dahulu.");
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
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker coordinate={formData.location} />
        </MapView>
        <TouchableOpacity
          onPress={() => navigation.navigate("PilihLokasiForAPK")}
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
  dropdown: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    marginTop: -15,
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

export default FormPasangAPKScreen;
