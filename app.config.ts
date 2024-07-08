import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'bang-abah',
  name: 'Bang Abah',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/bangabah.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/bangabah.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lsa.bangabah',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "This app needs access to your location to show you nearby places.",
      NSLocationAlwaysUsageDescription: "This app needs access to your location to provide continuous location updates.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/bangabah.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.lsa.bangabah',
    permissions: [
      "INTERNET",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    config: {
      googleMaps: {
        apiKey: 'AIzaSyCKQCWMwvwMTuBtoMNIBPKuf2sXDJT1f1E'
      }
    }
  },
  web: {
    favicon: './assets/bangabah.png',
  },
  plugins: [
    [
      'expo-image-picker',
      {
        photosPermission: 'The app needs access to your photos to allow you to share them with your friends.',
      },
    ],
    'expo-dev-client',
  ],
  extra: {
    eas: {
      projectId: 'da065f54-e573-427c-a385-5ca8741db933',
    },
  },
  owner: 'amaralkaff',
});
