// api/api.ts
import axios from "axios";
import qs from "qs";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL of the API server
const baseURL = "http://103.56.92.100:7001";
console.log(baseURL, "port number");

// Create an Axios instance for API server
const API_SERVER = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Set a timeout of 30 seconds
});

// Create an Axios instance for Auth server
const AUTH_SERVER = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  transformRequest: [(data) => qs.stringify(data)],
  timeout: 30000, // Set a timeout of 30 seconds
});

// Function to get auth headers with token
const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Function to handle errors
const handleError = async (error: any) => {
  if (axios.isAxiosError(error) && error.response) {
    console.log("Axios Error:", error.response);
    if (error.response.status === 401) {
      await AsyncStorage.removeItem("accessToken");
    }
    return Promise.reject(error.response.data);
  }
  console.log("Non-Axios Error:", error);
  return Promise.reject(error instanceof Error ? error.message : String(error));
};

// Function to retry requests on network errors
const retryRequest = async (requestFunc: () => Promise<any>, retries: number = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFunc();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      console.warn(`Retrying request... (${i + 1}/${retries})`);
    }
  }
};

// API functions
export const login = (username: string, password: string) => {
  return AUTH_SERVER.post("api/v1/login", {
    username,
    password,
  }).catch(handleError);
};

export const getJenisAPK = (token: string) =>
  retryRequest(() =>
    API_SERVER.get("api/v1/get_list_jenis_apk", {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const getListKabupaten = (token: string) =>
  retryRequest(() =>
    API_SERVER.get("api/v1/get_list_kabupaten", {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const getListKecamatan = (token: string, id_kabupaten: string) =>
  retryRequest(() =>
    API_SERVER.get(`api/v1/get_list_kecamatan?id_kabupaten=${id_kabupaten}`, {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const uploadAPK = (token: string, formData: FormData) =>
  retryRequest(() =>
    API_SERVER.post("api/v1/upload_apk", formData, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "multipart/form-data",
      },
    })
  ).catch(handleError);

export const uploadKanvasi = (token: string, formData: FormData) =>
  retryRequest(() =>
    API_SERVER.post("api/v1/upload_kanvasi", formData, {
      headers: {
        ...getAuthHeaders(token),
        "Content-Type": "multipart/form-data",
      },
    })
  ).catch(handleError);

export const getListAPK = (token: string) =>
  retryRequest(() =>
    API_SERVER.get("api/v1/get_list_apk", {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const getDetailAPK = (token: string, id: number) =>
  retryRequest(() =>
    API_SERVER.get(`api/v1/get_detail_apk?id=${id}`, {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const getListKanvasi = (token: string) =>
  retryRequest(() =>
    API_SERVER.get("api/v1/get_list_kanvasi", {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const getDetailKanvasi = (token: string, id: number) =>
  retryRequest(() =>
    API_SERVER.get(`api/v1/get_detail_kanvasi?id=${id}`, {
      headers: getAuthHeaders(token),
    })
  ).catch(handleError);

export const deleteAPK = (token: string, id: number) =>
  retryRequest(() =>
    API_SERVER.delete("api/v1/delete_apk", {
      headers: getAuthHeaders(token),
      params: { id },
    })
  ).catch(handleError);

export const deleteKanvasi = (token: string, id: number) =>
  retryRequest(() =>
    API_SERVER.delete("api/v1/delete_kanvasi", {
      headers: getAuthHeaders(token),
      params: { id },
    })
  ).catch(handleError);

export default API_SERVER;
