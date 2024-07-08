// stacks/AppNavigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import BerandaScreen from '../screens/BerandaScreen';
import ListAPKScreen from '../screens/ListAPKScreen';
import FormPasangAPKScreen from '../screens/FormPasangAPKScreen';
import DetailAPKScreen from '../screens/DetailAPKScreen';
import PilihKabupatenForAPKScreen from '../screens/PilihKabupatenForAPKScreen';
import PilihKabupatenForKanvasingScreen from '../screens/PilihKabupatenForKanvasingScreen';
import PilihKecamatanForAPKScreen from '../screens/PilihKecamatanForAPKScreen';
import PilihKecamatanForKanvasingScreen from '../screens/PilihKecamatanForKanvasingScreen';
import ListKanvasingScreen from '../screens/ListKanvasingScreen';
import FormPasangKanvasingScreen from '../screens/FormPasangKanvasingScreen';
import DetailKanvasingScreen from '../screens/DetailKanvasingScreen';
import PilihLokasiForAPKScreen from '../screens/PilihLokasiForAPKScreen';
import PilihLokasiForKanvasingScreen from '../screens/PilihLokasiForKanvasingScreen';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation: React.FC = () => {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={token ? "Beranda" : "Login"}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Beranda"
          component={BerandaScreen}
          options={{
            headerShown: true,
            headerBackVisible: false,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="ListAPK"
          component={ListAPKScreen}
          options={{
            title: "List APK",
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="FormPasangAPK"
          component={FormPasangAPKScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="PilihKabupatenForAPK"
          component={PilihKabupatenForAPKScreen}
          options={{
            headerBackVisible: true,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="PilihKabupatenForKanvasing"
          component={PilihKabupatenForKanvasingScreen}
          options={{
            headerBackVisible: true,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="PilihKecamatanForAPK"
          component={PilihKecamatanForAPKScreen}
          options={{
            headerBackVisible: true,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="PilihKecamatanForKanvasing"
          component={PilihKecamatanForKanvasingScreen}
          options={{
            headerBackVisible: true,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="PilihLokasiForAPK"
          component={PilihLokasiForAPKScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="PilihLokasiForKanvasing"
          component={PilihLokasiForKanvasingScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="DetailAPK"
          component={DetailAPKScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="Kanvasing"
          component={ListKanvasingScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="FormPasangKanvasing"
          component={FormPasangKanvasingScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="DetailKanvasing"
          component={DetailKanvasingScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
        <Stack.Screen
          name="ListKanvasi"
          component={ListKanvasingScreen}
          options={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ee8b60",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AppNavigation;
