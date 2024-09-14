import {
  MouseEventHandler,
  MouseEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "../toast/toast";
import { AUTO_CLOSE_DURATION, ToastProps } from "types/toastTypes";
import styles from "./toastList.module.scss";
import globals from "styles/globals.module.scss";
import { ToastContext } from "utils/context/toastContext";
import clsx from "clsx";
import { ANIMATION_DURATION } from "types/styleTypes";

export default function ToastList({ style }: { style?: React.CSSProperties }) {
  const toastContext = useContext(ToastContext);

  const handleClick = (
    e: MouseEvent<HTMLButtonElement>,
    onClick: MouseEventHandler<HTMLButtonElement> | undefined,
    id: number | undefined,
  ) => {
    onClick && onClick(e);
    id && toastContext.removeToast(id);
  };
  return (
    <div className={styles.toastList} style={style}>
      {toastContext.toasts.map((toast: ToastProps, i: number) => (
        <div className={styles.toastWrapper}>
          <Toast
            key={i}
            message={toast.message}
            type={toast.type}
            onClick={(e) => handleClick(e, toast.onClick, toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
