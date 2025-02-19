import { MouseEventHandler, MouseEvent, useContext } from "react";
import Toast from "../toast/toast";
import { ToastProps } from "types/toastTypes";
import styles from "./toastList.module.scss";
import { ToastContext } from "utils/context/toastContext";

export default function ToastList({ style }: { style?: React.CSSProperties }) {
  const toastContext = useContext(ToastContext);

  const handleClick = (
    e: MouseEvent<HTMLButtonElement>,
    onClick: MouseEventHandler<HTMLButtonElement> | undefined,
    id: number | undefined
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
