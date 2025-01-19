"use client";

import axios from "axios";
import Cookies from "js-cookie";

export const baseApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

export const clientApi = axios.create({
  baseURL: baseApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const cookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax" as const,
  expires: 7,
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set("accessToken", accessToken, cookieOptions);
  Cookies.set("refreshToken", refreshToken, cookieOptions);
};

export const clearAuthTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

export const getAccessToken = () => {
  const accessToken = Cookies.get("accessToken");
  if (!accessToken) {
    return null;
  }
  return accessToken;
};

export const getRefreshToken = () => {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) {
    return null;
  }
  return refreshToken;
};

clientApi.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
