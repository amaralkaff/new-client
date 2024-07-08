// types/navigation.ts
export type RootStackParamList = {
  Beranda: undefined;
  RequestLokasi:undefined;
  Login: undefined;
  ListAPK: { refresh?: boolean };
  FormPasangAPK: {
    kabupaten?: { id: string; name: string };
    kecamatan?: string;
    selectedLocation?: { latitude: number; longitude: number };
  };
  PilihKabupatenForAPK: {
    onGoBack?: (selectedKabupaten: { id: string; name: string }) => void;
  };
  PilihKecamatanForAPK: {
    kabupaten: { id: string; name: string };
    onGoBack?: (selectedKecamatan: string) => void;
  };
  PilihLokasiForAPK: undefined;
  DetailAPK: { apk: { id: number } };
  Kanvasing: undefined;
  DetailKanvasing: { kanvasing: { id: number } };
  FormPasangKanvasing: {
    kabupaten?: { id: string; name: string };
    kecamatan?: string;
    selectedLocation?: { latitude: number; longitude: number };
  };
  PilihKabupatenForKanvasing: undefined;
  PilihKecamatanForKanvasing: { kabupaten: { id: string; name: string } };
  PilihLokasiForKanvasing: undefined;
  ListKanvasi: { refresh?: boolean };
};
