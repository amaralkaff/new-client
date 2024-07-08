// screens/RequestLokasiScreen.tsx
import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type RequestLokasiScreenProps = StackScreenProps<
  RootStackParamList,
  "RequestLokasi"
>;

const RequestLokasiScreen: React.FC<RequestLokasiScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log(
          "This feature is not available (on this device / in this context)"
        );
        break;
      case RESULTS.DENIED:
        console.log(
          "The permission has not been requested / is denied but requestable"
        );
        requestLocationPermission();
        break;
      case RESULTS.LIMITED:
        console.log("The permission is limited: some actions are possible");
        break;
      case RESULTS.GRANTED:
        console.log("The permission is granted");
        getLocation();
        break;
      case RESULTS.BLOCKED:
        console.log("The permission is denied and not requestable anymore");
        break;
    }
  };

  const requestLocationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (result === RESULTS.GRANTED) {
      getLocation();
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        navigation.navigate("PilihLokasi", {
          selectedLocation: position.coords,
        });
      },
      (error) => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>We need your location to show the map</Text>
      <Button title="Allow Location" onPress={checkLocationPermission} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default RequestLokasiScreen;
