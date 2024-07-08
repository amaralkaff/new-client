// screens/PilihLokasiForAPKScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button } from "react-native-paper";
import * as Location from "expo-location";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type PilihLokasiForAPKScreenProps = StackScreenProps<
  RootStackParamList,
  "PilihLokasiForAPK"
>;

const PilihLokasiForAPKScreen: React.FC<PilihLokasiForAPKScreenProps> = ({
  navigation,
}) => {
  const [region, setRegion] = useState({
    latitude: -8.652933,
    longitude: 116.324807,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState({
    latitude: -8.652933,
    longitude: 116.324807,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMarker({
        latitude: lat,
        longitude: lng,
      });
      setLoading(false);
    })();
  }, []);

  const handleSelectLocation = () => {
    navigation.navigate("FormPasangAPK", { selectedLocation: marker });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            onPress={(e) => {
              const { coordinate } = e.nativeEvent;
              setMarker({
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
              });
            }}
          >
            <Marker
              coordinate={marker}
              draggable
              onDragEnd={(e) => {
                const { coordinate } = e.nativeEvent;
                setMarker({
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
              }}
            />
          </MapView>
          <Button
            mode="contained"
            onPress={handleSelectLocation}
            style={styles.button}
          >
            Select Location
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 100,
  },
  button: {
    margin: 20,
    backgroundColor: "#ee8b60",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PilihLokasiForAPKScreen;

