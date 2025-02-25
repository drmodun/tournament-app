import { MouseEventHandler, MouseEvent } from "react";
import Toast from "../toast/toast";
import { ToastProps } from "types/toastTypes";
import styles from "./toastList.module.scss";
import { useToastContext } from "utils/hooks/useToastContext";

export default function ToastList({ style }: { style?: React.CSSProperties }) {
  const toastContext = useToastContext();

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
        <div
          className={styles.toastWrapper}
          key={toast.message + "wrapper" + i}
        >
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
