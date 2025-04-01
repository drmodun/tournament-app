"use client";

import { useContext } from "react";
import { NotificationContext } from "utils/context/notificationContext";

export const useNotificationContext = () => useContext(NotificationContext);
