import { useContext } from "react";
import Toast from "../toast/toast";
import { ToastProps } from "types/toastTypes";
import styles from "./toastList.module.scss";
import { ToastContext } from "context/toastContext";

export default function ToastList({ style }: { style?: React.CSSProperties }) {
  const toastContext = useContext(ToastContext);
  return (
    <div className={styles.toastList} style={style}>
      {toastContext.toasts.map((toast: ToastProps, i: number) => (
        <div className={styles.toastWrapper}>
          <Toast
            key={i}
            message={toast.message}
            type={toast.type}
            onClick={toast.onClick}
          />
        </div>
      ))}
    </div>
  );
}
