"use client";

import { AxiosResponse } from "axios";
import { clientApi } from "../../base";
import { INotificationResponse, NotificationQueryParams } from "./types";

export const getNotifications = async (params: NotificationQueryParams) =>
  clientApi
    .get<
      never,
      AxiosResponse<INotificationResponse[]>
    >("/notifications", { params })
    .then((res) => res.data);

export const requestNewToken = async () =>
  clientApi
    .post<
      never,
      AxiosResponse<{ id: number; sseToken: string }>
    >("/notifications/token")
    .then((res) => res.data);

export const markNotificationAsRead = async (id: number) =>
  clientApi
    .patch<never, AxiosResponse<void>>(`/notifications/${id}/read`)
    .then(() => {});

export const markAllNotificationsAsRead = async () =>
  clientApi
    .patch<never, AxiosResponse<void>>("/notifications/read/all")
    .then(() => {});

export const markBulkNotificationsAsRead = async (ids: number[]) =>
  clientApi
    .patch<
      { ids: number[] },
      AxiosResponse<void>
    >("/notifications/read/bulk", { ids })
    .then(() => {});

export const deleteNotification = async (id: number) =>
  clientApi
    .delete<never, AxiosResponse<void>>(`/notifications/${id}`)
    .then(() => {});
