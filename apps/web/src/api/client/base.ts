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
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/auth/refresh") {
      clearAuthTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    try {
      const response = await clientApi.get<any>("/auth/refresh", {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      setAuthTokens(accessToken, newRefreshToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return clientApi(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  },
);

export const LARGE_QUERY_RETRY_ATTEMPTS = 2;
export const LARGE_QUERY_RETRY_DELAY = 1500;
export const MEDIUM_QUERY_RETRY_ATTEMPTS = 3;
export const MEDIUM_QUERY_RETRY_DELAY = 500;
export const SMALL_QUERY_RETRY_ATTEMPTS = 4;
export const SMALL_QUERY_RETRY_DELAY = 250;
